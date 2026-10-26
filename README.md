# 📻 Radios Françaises - Home Assistant Add-on

[![Home Assistant Add-on](https://img.shields.io/badge/Home%20Assistant-Add--on-blue.svg?logo=homeassistant&logoColor=white)](https://www.home-assistant.io/)
[![Ingress](https://img.shields.io/badge/Ingress-Supporté-green.svg)](https://www.home-assistant.io/blog/2019/04/15/ingress/)
[![Architecture](https://img.shields.io/badge/Arch-aarch64%20%7C%20amd64%20%7C%20armv7%20%7C%20armhf%20%7C%20i386-orange.svg)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)]()

Un module complémentaire (Add-on) pour **Home Assistant** offrant un lecteur moderne, fluide et réactif des grandes radios musicales françaises en direct : **Europe 2**, **NRJ**, **Fun Radio** et **Radio FG**.

Inspiré de l'architecture des dépôts d'add-ons Home Assistant (comme `florianfish/TeslaLocatorPG`), ce module intègre le support d'**Ingress**, la détection des titres et pochettes en direct, ainsi que les commandes pour piloter vos enceintes connectées (`media_player`).

---

## ✨ Fonctionnalités

- 🚀 **Intégration Ingress 100% native** : Accédez au lecteur directement depuis le menu latéral de Home Assistant, sans ouvrir de port sur votre routeur.
- 🎵 **4 grandes stations françaises officielles** :
  - **Europe 2** : Direct Pop-Rock & Hits avec API officielle
  - **NRJ** : Hit Music Only & suivi des titres
  - **Fun Radio** : Dance, Latino & Electro
  - **Radio FG** : Feel Good & Clubbing DJ sets
- 🎶 **Affichage des titres et pochettes en direct** : Rafraîchissement automatique de la chanson diffusée à l'antenne avec liens Spotify / YouTube / Apple Music.
- 🔊 **Compatibilité Enceintes Connectées** : Envoyez les flux vers vos enceintes Google Cast / Nest, Sonos, Amazon Echo, HomePod et ESPHome via `media_player.play_media`.
- ⚡ **Ultra rapide & économe en ressources** : Développé en React 19, Tailwind CSS et Node.js.
- 📱 **Design responsive & thème Elegant Dark** : Parfaitement adapté à l'application mobile Home Assistant Companion (iOS & Android) et aux écrans de contrôle muraux.

---

## 🛠️ Installation dans Home Assistant

### 1. Ajouter le dépôt
1. Dans Home Assistant, allez dans **Paramètres** > **Modules complémentaires** > **Boutique des modules complémentaires**.
2. Cliquez sur les **3 points** en haut à droite > **Dépôts**.
3. Ajoutez l'URL de votre dépôt :
   ```text
   https://github.com/florianfish/TeslaLocatorPG
   ```
4. Cliquez sur **Ajouter**.

### 2. Installer et démarrer
1. Dans la boutique, sélectionnez **Radios Françaises**.
2. Cliquez sur **Installer**.
3. Activez **Lancer au démarrage** et **Afficher dans la barre latérale**.
4. Cliquez sur **Démarrer**.
5. Cliquez sur **Radios FR** dans la barre latérale pour profiter de vos radios !

---

## 📦 Structure du Dépôt

```text
├── config.yaml          # Manifeste de configuration Home Assistant (Ingress, arch, options)
├── repository.yaml      # Métadonnées du dépôt d'Add-ons pour la boutique HA
├── Dockerfile           # Image Docker multi-architecture (Alpine / Node.js)
├── build.yaml           # Définition des images de base par architecture
├── run.sh               # Script de démarrage compatible Supervisor & bashio
├── DOCS.md              # Documentation intégrée dans l'interface Home Assistant
├── README.md            # Présentation générale du projet
├── server.ts            # Serveur Express (Proxy audio, métadonnées, REST API)
├── src/                 # Application Frontend React 19 + Tailwind CSS
└── public/logos/        # Logos vectoriels et haute définition officiels
```

---

## 📡 Flux Audio Directs

| Radio | Format | URL du flux |
| :--- | :--- | :--- |
| **Europe 2** | MP3 128k | `https://europe2.lmn.fm/europe2.mp3` |
| **NRJ** | MP3 128k | `https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3` |
| **Fun Radio** | MP3 128k | `https://icecast.funradio.fr/fun-1-44-128?listen=webCwsAudioStream` |
| **Radio FG** | MP3 128k | `https://radiofg.impek.com/fg` |

---

## 🤖 Exemple d'automatisation Home Assistant

```yaml
alias: "Matinée - Radio Europe 2"
trigger:
  - platform: time
    at: "07:30:00"
action:
  - action: media_player.play_media
    target:
      entity_id: media_player.enceinte_cuisine
    data:
      media_content_id: "https://europe2.lmn.fm/europe2.mp3"
      media_content_type: "music"
mode: single
```

---

## 📄 Licence

Distribué sous licence MIT.
