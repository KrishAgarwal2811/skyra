import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageListener } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#utils/constants';
import { deleteMessage, sendTemporaryMessage } from '#utils/functions';
import { getContent } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<ModerationMessageListener.Options>({
	reasonLanguageKey: LanguageKeys.Events.Moderation.Messages.ModerationMessages,
	reasonLanguageKeyWithMaximum: LanguageKeys.Events.Moderation.Messages.ModerationMessagesWithMaximum,
	keyEnabled: GuildSettings.Selfmod.Messages.Enabled,
	ignoredChannelsPath: GuildSettings.Selfmod.Messages.IgnoredChannels,
	ignoredRolesPath: GuildSettings.Selfmod.Messages.IgnoredRoles,
	softPunishmentPath: GuildSettings.Selfmod.Messages.SoftAction,
	hardPunishmentPath: {
		action: GuildSettings.Selfmod.Messages.HardAction,
		actionDuration: GuildSettings.Selfmod.Messages.HardActionDuration,
		adder: 'messages'
	}
})
export class UserModerationMessageListener extends ModerationMessageListener {
	private readonly kChannels = new WeakMap<TextChannel, string[]>();

	protected async preProcess(message: GuildMessage): Promise<1 | null> {
		// Retrieve the threshold
		const [threshold, queueSize] = await readSettings(message.guild, [
			GuildSettings.Selfmod.Messages.Maximum,
			GuildSettings.Selfmod.Messages.QueueSize
		]);
		if (threshold === 0) return null;

		// Retrieve the content
		const content = getContent(message);
		if (content === null) return null;

		// Retrieve the contents, then update them to add the new content to the FILO queue.
		const contents = this.getContents(message);
		const count = this.updateContents(contents, content.toLowerCase(), queueSize);

		// If count is bigger than threshold
		// - return `count`
		// - else return `null` (stops)
		return count > threshold ? 1 : null;
	}

	protected onDelete(message: GuildMessage) {
		return deleteMessage(message);
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return sendTemporaryMessage(message, t(LanguageKeys.Events.Moderation.Messages.MessageFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction) {
		return new MessageEmbed()
			.setDescription(message.content)
			.setColor(Colors.Red)
			.setAuthor({
				name: `${message.author.tag} (${message.author.id})`,
				iconURL: message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
			})
			.setFooter({ text: `#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Events.Moderation.Messages.MessageFooter)}` })
			.setTimestamp();
	}

	private getContents(message: GuildMessage) {
		const previousValue = this.kChannels.get(message.channel as TextChannel);
		if (typeof previousValue === 'undefined') {
			const nextValue: string[] = [];
			this.kChannels.set(message.channel as TextChannel, nextValue);
			return nextValue;
		}

		return previousValue;
	}

	private updateContents(contents: string[], content: string, queueSize: number) {
		// Queue FILO behavior, first-in, last-out.
		if (contents.length >= queueSize) contents.length = queueSize - 1;
		contents.unshift(content);

		return contents.reduce((accumulator, ct) => (ct === content ? accumulator + 1 : accumulator), 1);
	}
}
