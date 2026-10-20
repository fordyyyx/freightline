# Platform

Interfaces for anything that differs between the web build and a future desktop build.

- `SaveStore`: save, load, list, and delete games. The web build uses localStorage; nothing outside this folder touches localStorage directly.
- `PlatformServices`: optional extras such as achievements, which do nothing on the web.
- Game code depends on these interfaces, never on a specific implementation.