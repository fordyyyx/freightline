# UI

React components: the map, panels, and controls the player sees.

- Reads engine snapshots and sends commands to the engine; holds no game rules.
- Local React state is only for presentation (for example, which panel is open), never for game state.
- All visible text uses British English.
- Numbers, date, and money are formatted through the shared formatting helper.
