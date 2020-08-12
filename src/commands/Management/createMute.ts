import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private rolePrompt = this.definePrompt('<role:rolename>');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 150,
			description: (language) => language.tget('COMMAND_CREATEMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.tget('COMMAND_CREATEMUTE_EXTENDED'),
			permissionLevel: PermissionLevels.Administrator,
			requiredGuildPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		if (await message.ask(message.language.tget('ACTION_SHARED_ROLE_SETUP_EXISTING'))) {
			const [role] = (await this.rolePrompt
				.createPrompt(message, { time: 30000, limit: 1 })
				.run(message.language.tget('ACTION_SHARED_ROLE_SETUP_EXISTING_NAME'))) as [Role];
			await message.guild!.settings.update(GuildSettings.Roles.Muted, role, {
				extraContext: { author: message.author.id }
			});
		} else if (await message.ask(message.language.tget('ACTION_SHARED_ROLE_SETUP_NEW'))) {
			await message.guild!.security.actions.muteSetup(message);
			await message.sendLocale('COMMAND_SUCCESS');
		} else {
			await message.sendLocale('MONITOR_COMMAND_HANDLER_ABORTED');
		}
	}
}
