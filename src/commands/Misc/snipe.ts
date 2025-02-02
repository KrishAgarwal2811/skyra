import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { getSnipedMessage } from '#utils/functions';
import { getColor, getContent, getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['sniped'],
	description: LanguageKeys.Commands.Misc.SnipeDescription,
	detailedDescription: LanguageKeys.Commands.Misc.SnipeExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	permissionLevel: PermissionLevels.Moderator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const sniped = getSnipedMessage(message.channel);
		if (sniped === null) this.error(LanguageKeys.Commands.Misc.SnipeEmpty);

		const embed = new MessageEmbed()
			.setTitle(args.t(LanguageKeys.Commands.Misc.SnipeTitle))
			.setColor(getColor(sniped))
			.setAuthor({ name: sniped.author.username, iconURL: sniped.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }) })
			.setTimestamp(sniped.createdTimestamp);

		const content = getContent(sniped);
		if (content !== null) embed.setDescription(content);
		const image = getImage(sniped);
		if (image !== null) embed.setImage(image);

		return send(message, { embeds: [embed] });
	}
}
