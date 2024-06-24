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
  - Actions are logged
  - Description: Requires the user to be a server administrator. Creates a message with preset reactions.
 
- Purge Messages
  - `/purge user`
  - Restricted to server administrators only
  - Actions are logged
  - Description: Removes up to 100 messages within the last 14 days on the current text-channel. User can be selected by the command itself. It is possible to select Chocobob. Success message will disappear after 10 seconds.

### Server
- All commands are restricted to server administrators only. All actions are logged.
- Server Status
  - `/server`
  - Description: Required to allow the bot to use all of its commands and log commands.
    
- Server Registration/De-Registration
   - `/server register`
  - Description: Allow Chocobob to log administrative actions, support FFXIV players with their Lodestone, and much more, by registering with Chocobob. "De-registering" with Chocobob will involve the removal of most if not all data related to your server.\n\nIt is **not** required to register with Chocobob, but some commands may not be available.'

- Set Free Company Id
  - `/server addfc` or `/fc addfc`
  - Supports multiple Free Companies, but they must be added one at a time.
  - Description: Registers a FFXIV Free Company with a server to prevent having to repeat FC id for commands.

- Remove Free Company Id
  - `/fc removefc`
  - Description: Remove a registered free company id from the server.
 
- List of Free Companies Registered
  - `/fc registry`
  - Description: See list of free company ids registered to this server.
 
- List of Free Companies Roles
  - `/fc roles`
  - Description: See list of free company id related roles to this server.
 
- Set Auto Roles for Free Companies
  - `/fc setautoroles`
  - Requires that `/fc setautoroles` is enabled.
  - Applies an auto role when a user verifies, if an only if `setautoroles` is enabled.
  - Two roles are set: the first is for a user who is a member of the FC, and the second is for the user who is not a member of the FC.
  - If a user already has these roles when they verify, but they are not a member of the FC then you can enable `/fc allowautoroleremoval` which will allow the bot to enforce the FC auto roles.
  - Description: Set roles for matching FC ex. inFC:Member, notIn:Guest

- Set Nomination Roles
  - `/server setnomroles`
  - Restricted to server administrators only.
  - Description: Allows nomination command to know which server roles to rely on when promoting.

- Clear Nomination Roles
  - `/server clearnomroles`
  - Description: Clears server roles to rely on when promoting during `/nominate`.

- Set Headpat Roles
  - `/server setheadpatroles`
  - Description: Allows headpat command to know which roles to rely on when assigning based off headpat count. Overwrites existing headpat roles.

- Allow Headpat Roles
  - `/server headpatrolestatus`
  - When false, users can still use `/headpats`
  - Description: Prevents bot from assigning headpat roles when `/headpats` command is ran. Still tracks headpat count. Is enabled by default.

- Server Logs
  - `/log channel`
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
  - `/givefeathers category user` or `/givefeathers category voicechannel`
  - 5 minute cooldown enforced.
  - Description: Recognize server participation or general good heartedness by giving a Chocobo Feather to one or more users.

- Remove User's Feathers
  - `/featherconfig user`  
  - Restricted to server administrators only.
  - Description: Removes all feathers associated with a user, but it will not remove any applied feather roles from a user.

- Change Feather Limit
  - `/featherconfig setlimit`
  - Restricted to server administrators only.
  - Example: Combat:War Lord:34
  - Description: Changes the necessary feather limit before a user can receive the category's associated role.
 
### FFXIV
- Free Company Stats Card
  - `/fcstats freecompanyid`
  - 5 minute cooldown enforced.
  - Description: Retrieves Free Company statistics based off the server's registered Free Company Id or the Free Company Id provided by the user.

- Lodestone Notices on Demand
  - `/lodestone lookup`
  - Description: NA Lodestone news lookups of latest/current. Maintenance lookup assumed.

- List My Characters
  - `/verify mycharacters`
  - Description: List your verified characters.

- Verify Help/Guide
  - `/verify help`
  - Description: Get help about `/verify` command.
 
- Verify Character
  - `/verify characterid` or `/verify charactername datacenter homeworld`
  - Multiple characters supported.
  - Provided a key for the user to add to their Lodestone profile. Command must be ran again when key is applied to profile.
  - Description: Register the bot with your FFXIV Lodestone character.

- Remove Verified Character from Bot's Database
  - `/verify removecharacterid`
  - Removes a character from the bot.
  - Description: Unverify a character id.
 
- Character Card
  - `/whoami characterid` or `/whoami user`
  - 5 minute cooldown enforced.
  - User can only be used if that user has verified and registered their character with the bot.
  - Character Id can always be used.
  - Description: Retrieves Character information based off the character id provided in the Lodestone.
 
### Fun
- Show Love
  - `/showlove love`
  - User can bonk, doubt, remind to drink water, and more to themselves or others.
  - Description: `/showlove love:bonk` someone with your strong hand.

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

- Ship Settings
  - `/shipsettings shipa shipb shipalwaysbelow` or `/shipsettings shipa shipb shipalwaysabove`
  - Restricted to server administrators only.
  - Description: Ensures that a ship will always be below or above a specific number between 0 and 100.
