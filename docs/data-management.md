# Data management

## System architecture

We currently have 8 servers: one for each gamemode, and one backend. The backend runs the map bot, the #game-staff-chat discord bot, and the database.

The database is MongoDB. It is accessed through HTTP endpoints on a backend server.

## FishPlayer

Most important player information is stored in the FishPlayer class. This data needs to be synced between servers.

### Data

See `type FishPlayerData` in [src/types.ts](src/types.ts) for up-to-date information.

Some data is "unsynced", meaning it is not synced between servers and can be different on each server. However, this data is still stored on the database, to make it easy to change the gamemode of a server.

Most unsynced data is tied to a gamemode, so it is indexed by the gamemode name. However, the USID is tied to the IP address of the server, so it is indexed by IP address.

Immutable data:
* uuid: string

Important data:
* muted: boolean
* unmarkTime: number
* rank: string
* flags: string[]

Unimportant data:
* name: string
* highlight: string | null
* rainbow: { speed:number; } | null
* history: PlayerHistoryEntry[]
* chatStrictness: "chat" | "strict"
* showRankPrefix: boolean

Unsynced data:
* usid: string | null
* lastJoined: number
* firstJoined: number
* stats: <object>

### Syncing algorithm

When a player joins the server (connectpacket):
  * Fetch data from the backend
  * This data may arrive before or after the player connects. Some code needs to be run on data fetch, some code needs to be run on connect, and some needs to be run on both.

When some important state needs to be updated (for example, rank):
  * Fetch data from the backend again, because the data in cache may be outdated if it has been modified on the database.
  * Make the necessary change to the data
  * Save it to the backend

When unimportant state needs to be updated (for example, /rainbow):
  * Modify the data currently in memory.

When the player leaves:
  * Save **only the unimportant fields** to the database.

### Example scenarios

A player may join two servers at once:
|Server A|Server B|
|--------|--------|
|Player joins   |        |
|        |Player joins   |
|Set rank|        |
|(fetch) |        |
|(update)|        |
|(store) |        |
|        |Set flag|
|        |(fetch) |
|        |(now Server B knows about the new rank)|
|        |(update)|
|        |(store) |
|        |Leaves  |
|        |(store unimportant or unsynced state)|
|Leaves  |        |
|(store unimportant or unsynced state)|        |

### Backend handling

For unsynced data, the backend needs to store a different value from each server. In the MongoDB document, the data is stored as a mapping from gamemode to value. When data is fetched or saved, the backend needs to return or modify only the appropriate value for the server making the request.

Updates to the history field use the setUnion operation. It is not possible for a server to remove history entries, only the backend can do this. Therefore, if a player is connected to two servers at once and their history is updated in both servers, no data will be lost.

To simplify validation, the "Save only the unimportant fields to the database" operation sends **all** fields to the backend, and the backend selects and saves only the unimportant fields.

## FishPlayer transients

Some values are not important enough to store, and are only useful for a short time. For example: flag variables used for implementation, references to the player's pet, or a list of menus to show to the player.

These values are considered transients, and are only stored in memory. They are discarded when the server restarts. Some transients must be reset whenever the player reconnects, such as the counter for the number of blocks the player has broken.

## Bans

Banned IPs and banned UUIDs are both stored separately from fish player data, as a Set<string> on the backend.

The server queries ban data when it receives a ConnectPacket. To allow for unbanning IPs, the server also queries ban data when it receives a ConnectionEvent for a banned IP. However, by the time the query response comes back, Mindustry will have already kicked the player, so unbanned players will need to join twice.

Bans do not spread automatically: for example, if the UUID `bbbbbbb` and the IP `1.2.3.4` are banned, and a player attempts to connect from UUID `cccccc` and IP `1.2.3.4`, the connection will be rejected, but the UUID `cccccc` will **not** become banned.

## Player count data

The number of players online is saved once every 4 minutes.

Player count data is stored on each server using the serialization framework.

## Map data

Some information about the current map run is stored locally, to keep it through a server restart. The maximum player count reached and the time elapsed are stored in `Core.settings`.

Some information is stored for each run on a map. See `class FinishedMapRun` in [src/maps.ts](src/maps.ts) for up-to-date information.

Map run data is stored on each server using the serialization framework. This data gets processed into statistics and displayed by the `/mapinfo` command.

## Vanilla PlayerInfo

We use the vanilla PlayerInfo system to track the following fields for moderation:
* Times joined
* Times kicked
* List of past names
* List of past IPs

These fields are read by the `info` and `/info` commands. Join count is used in many places throughout the plugin for decision logic.

This data is currently not synced.

