import { channelFlags, channelOffset, permissionsFlags, permissionsOffset, toChannelsArray, toPermissionsArray } from '#utils/bits';
import { GuildSystemChannelFlags, PermissionFlagsBits } from 'discord-api-types/v9';

describe('Bits', () => {
	describe('Permissions', () => {
		test('GIVEN permissionsFlags.size THEN returns 41', () => {
			expect(permissionsFlags.size).toBe(41);
		});

		test('GIVEN permissionsOffset THEN returns 41', () => {
			expect(Number(permissionsOffset)).toBe(41);
		});

		test('GIVEN various permissions THEN returns an array of their names', () => {
			const value = PermissionFlagsBits.AddReactions | PermissionFlagsBits.Connect | PermissionFlagsBits.ManageRoles;
			expect(toPermissionsArray(value)).toStrictEqual(['ADD_REACTIONS', 'CONNECT', 'MANAGE_ROLES']);
		});

		test('GIVEN all permissions THEN returns an array with all the names', () => {
			const value =
				PermissionFlagsBits.CreateInstantInvite |
				PermissionFlagsBits.KickMembers |
				PermissionFlagsBits.BanMembers |
				PermissionFlagsBits.Administrator |
				PermissionFlagsBits.ManageChannels |
				PermissionFlagsBits.ManageGuild |
				PermissionFlagsBits.AddReactions |
				PermissionFlagsBits.ViewAuditLog |
				PermissionFlagsBits.PrioritySpeaker |
				PermissionFlagsBits.Stream |
				PermissionFlagsBits.ViewChannel |
				PermissionFlagsBits.SendMessages |
				PermissionFlagsBits.SendTTSMessages |
				PermissionFlagsBits.ManageMessages |
				PermissionFlagsBits.EmbedLinks |
				PermissionFlagsBits.AttachFiles |
				PermissionFlagsBits.ReadMessageHistory |
				PermissionFlagsBits.MentionEveryone |
				PermissionFlagsBits.UseExternalEmojis |
				PermissionFlagsBits.ViewGuildInsights |
				PermissionFlagsBits.Connect |
				PermissionFlagsBits.Speak |
				PermissionFlagsBits.MuteMembers |
				PermissionFlagsBits.DeafenMembers |
				PermissionFlagsBits.MoveMembers |
				PermissionFlagsBits.UseVAD |
				PermissionFlagsBits.ChangeNickname |
				PermissionFlagsBits.ManageNicknames |
				PermissionFlagsBits.ManageRoles |
				PermissionFlagsBits.ManageWebhooks |
				PermissionFlagsBits.ManageEmojisAndStickers |
				PermissionFlagsBits.UseApplicationCommands |
				PermissionFlagsBits.RequestToSpeak |
				PermissionFlagsBits.ManageEvents |
				PermissionFlagsBits.ManageThreads |
				PermissionFlagsBits.CreatePublicThreads |
				PermissionFlagsBits.CreatePrivateThreads |
				PermissionFlagsBits.UseExternalStickers |
				PermissionFlagsBits.ModerateMembers;
			expect(toPermissionsArray(value)).toStrictEqual([
				'CREATE_INSTANT_INVITE',
				'KICK_MEMBERS',
				'BAN_MEMBERS',
				'ADMINISTRATOR',
				'MANAGE_CHANNELS',
				'MANAGE_GUILD',
				'ADD_REACTIONS',
				'VIEW_AUDIT_LOG',
				'PRIORITY_SPEAKER',
				'STREAM',
				'VIEW_CHANNEL',
				'SEND_MESSAGES',
				'SEND_TTS_MESSAGES',
				'MANAGE_MESSAGES',
				'EMBED_LINKS',
				'ATTACH_FILES',
				'READ_MESSAGE_HISTORY',
				'MENTION_EVERYONE',
				'USE_EXTERNAL_EMOJIS',
				'VIEW_GUILD_INSIGHTS',
				'CONNECT',
				'SPEAK',
				'MUTE_MEMBERS',
				'DEAFEN_MEMBERS',
				'MOVE_MEMBERS',
				'USE_VAD',
				'CHANGE_NICKNAME',
				'MANAGE_NICKNAMES',
				'MANAGE_ROLES',
				'MANAGE_WEBHOOKS',
				'MANAGE_EMOJIS_AND_STICKERS',
				'USE_APPLICATION_COMMANDS',
				'REQUEST_TO_SPEAK',
				'MANAGE_EVENTS',
				'MANAGE_THREADS',
				'CREATE_PUBLIC_THREADS',
				'CREATE_PRIVATE_THREADS',
				'USE_EXTERNAL_STICKERS',
				'MODERATE_MEMBERS'
			]);
		});
	});

	describe('Channel', () => {
		test('GIVEN channelFlags.size THEN returns 4', () => {
			expect(channelFlags.size).toBe(4);
		});

		test('GIVEN channelOffset THEN returns 4', () => {
			expect(channelOffset).toBe(4);
		});

		test('GIVEN various flags THEN returns an array of their flags', () => {
			const value = GuildSystemChannelFlags.SuppressJoinNotifications | GuildSystemChannelFlags.SuppressPremiumSubscriptions;
			expect(toChannelsArray(value)).toStrictEqual(['SUPPRESS_JOIN_NOTIFICATIONS', 'SUPPRESS_PREMIUM_SUBSCRIPTIONS']);
		});

		test('GIVEN all flags THEN returns an array with all the flags', () => {
			const value =
				GuildSystemChannelFlags.SuppressJoinNotifications |
				GuildSystemChannelFlags.SuppressJoinNotificationReplies |
				GuildSystemChannelFlags.SuppressPremiumSubscriptions |
				GuildSystemChannelFlags.SuppressGuildReminderNotifications;
			expect(toChannelsArray(value)).toStrictEqual([
				'SUPPRESS_JOIN_NOTIFICATIONS',
				'SUPPRESS_PREMIUM_SUBSCRIPTIONS',
				'SUPPRESS_GUILD_REMINDER_NOTIFICATIONS',
				'SUPPRESS_JOIN_NOTIFICATION_REPLIES'
			]);
		});
	});
});
