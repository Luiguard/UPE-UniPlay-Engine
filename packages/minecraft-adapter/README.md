# UniPlay Minecraft Adapter

Dieses Package integriert UniPlay in Minecraft-Server ohne neue APIs zuzuweisen. Es nutzt die bestehende Minecraft-Server-API (z.B. Spigot/Paper) und bindet UniPlay's Microtasks und Consensus ein.

## Verwendung

1. Baue das Package: `pnpm build`
2. Kopiere `dist/` in deinen Minecraft-Server plugins-Ordner.
3. Starte den Server – UniPlay läuft im Hintergrund.

## Wie es funktioniert

- **Ohne neue API**: Nutzt Minecraft's Event-System (z.B. EntityMoveEvent).
- **Integration**: Entities werden als UniPlay-Tasks behandelt, Microtasks an Clients verteilt.
- **Consensus**: Mehrere Spieler validieren Änderungen.

## Beispiel

```java
// In Minecraft-Plugin
UniPlayMinecraftPlugin plugin = new UniPlayMinecraftPlugin();
plugin.onEnable(); // Startet UniPlay
```

Für vollständige Integration: Übersetze TS zu Java oder verwende Nashorn für JS in Java.