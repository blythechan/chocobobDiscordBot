# Commands
### Utility
- Permissions
  - `/permissions user action reason notify`
  - Restricted to server administrators only
  - Actions are logged
  - Description: Add or removes a role for a user, kicks the user, or bans the user.
 
- Ping
  - `/ping`
  - Description: Checks and displays latency between bot and client.
 
- Polls
  - `/poll description emoteA emoteB emoteC emoteD`
  - Description: Requires the user to be a server administrator. Creates a message with preset reactions.
 
- Purge Messages
  - `/purge user`
  - Restricted to server administrators only
  - Actions are logged
  - Description: Removes up to 100 messages within the last 14 days on the current text-channel. User can be selected by the command itself. It is possible to select Chocobob. Success message will disappear after 10 seconds.

### Server
- Server Status
  - `/server`
  - Description: Required to allow the bot to use all of its commands and log commands.
    
- Server Registration/De-Registration
   - `/server register`
  - Restricted to server administrators only.
  - Description: Allow Chocobob to log administrative actions, support FFXIV players with their Lodestone, and much more, by registering with Chocobob. "De-registering" with Chocobob will involve the removal of most if not all data related to your server.\n\nIt is **not** required to register with Chocobob, but some commands may not be available.'

- Set Free Company Id
  - `/server freecompanyid`
  - Restricted to server administrators only.
  - Description: Registers a FFXIV Free Company with a server to prevent having to repeat FC id for commands.
    
- Set Nomination Roles
  - `/server setnomroles`
  - Restricted to server administrators only.
  - Description: Allows nomination command to know which server roles to rely on when promoting.

- Clear Nomination Roles
  - `/server clearnomroles`
  - Restricted to server administrators only.
  - Description: Clears server roles to rely on when promoting during `/nominate`.

- Set Headpat Roles
  - `/server setheadpatroles`
  - Restricted to server administrators only.
  - Description: Allows headpat command to know which roles to rely on when assigning based off headpat count. Overwrites existing headpat roles.

- Allow Headpat Roles
  - `/server headpatrolestatus`
  - Restricted to server administrators only.
  - When false, users can still use `/headpats`
  - Description: Prevents bot from assigning headpat roles when `/headpats` command is ran. Still tracks headpat count. Is enabled by default.

- Server Logs
  - `/log channel`
  - Restricted to server administrators only.
  - Description: Retrieves the latest 50 logs pertaining to your server, and attempts to export it into a text file before sending it off to the specified text channel. Success response is ephemeral, but the export is visible to all depending on text channel.
 
### Nominations
- Remove Nomination
  - `/removenomination`
  - Restricted to server administrators only.
  - Description: Cancels and removes an existing or old nomination by its message Id. Example: `/removenomination <messageId>`.

- Set Nomination
  - `/nominate user`
  - 12 hour cooldown enforced.
  - Description: Nominate a user for a promotion. Requires server to be registered and server roles to be set with Chocobob.
 
### Feathers
- Feather Card
  - `/feathercard user`
  - Description: View yours or another user's existing feathers.

- Give Feathers
  - `/givefeathers category user voicechannel`
  - 5 minute cooldown enforced.
  - Description: Recognize server participation or general good heartedness by giving a Chocobo Feather to one or more users.
 
### FFXIV
- Free Company Stats Card
  - `/fcstats freecompanyid`
  - 5 minute cooldown enforced.
  - Description: Retrieves Free Company statistics based off the server's registered Free Company Id or the Free Company Id provided by the user.

- Lodestone Notices on Demand
  - `/lodestone lookup`
  - Description: NA Lodestone news lookups of latest/current. Maintenance lookup assumed.
 
- Verify Character
  - `/verify characterid`
  - Provided a key for the user to add to their Lodestone profile. Command must be ran again when key is applied to profile.
  - Description: Register the bot with your FFXIV Lodestone character.
 
- Character Card
  - `/whoami characterid user`
  - 5 minute cooldown enforced.
  - User can only be used if that user has verified and registered their character with the bot.
  - Character Id can always be used.
  - Description: Retrieves Character information based off the character id provided in the Lodestone.
 
### Fun
- Bonk
  - `/bonk user`
  - User can bonk themselves if they do not provide an option.
  - Description: Bonk someone with your strong hand.

- Headpats
  - `/headpats user`
  - 5 minute cooldown enforced.
  - If no user is provided, the bot will receive the headpat.
  - Will apply aesthetic roles if server headpat roles are allowed and set.
  - Keeps track of bot headpats and user headpats seperately.
  - Description: Praise the bot or another user with a headpat.
- Ship
  - `/ship userA userB`
  - Description: Jokingly displays the probability of compatibility between two users.
