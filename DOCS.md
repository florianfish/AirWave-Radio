# Documentation - Add-on Radios Françaises pour Home Assistant

Ce module complémentaire (Add-on) transforme votre Home Assistant en un récepteur radio en direct haute fidélité pour les principales stations musicales françaises : **Europe 2**, **NRJ**, **Fun Radio** et **Radio FG**.

Il intègre nativement la technologie **Ingress**, vous permettant d'accéder à l'interface directement depuis la barre latérale de Home Assistant, sans ouvrir de port externe ni configurer de redirection réseau.

---

## Sommaire

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Accès via Ingress (Barre latérale)](#accès-via-ingress-barre-latérale)
4. [Diffuser sur vos enceintes (Sonos, Google Cast, Alexa, ESPHome)](#diffuser-sur-vos-enceintes)
5. [Intégration Lovelace (Dashboard Home Assistant)](#intégration-lovelace)
6. [Capteur REST pour afficher le titre en cours](#capteur-rest-pour-afficher-le-titre-en-cours)
7. [Dépannage & FAQ](#dépannage--faq)

---

## 1. Installation

### Étape 1 : Ajouter le dépôt dans Home Assistant
1. Dans Home Assistant, rendez-vous dans **Paramètres** > **Modules complémentaires** > **Boutique des modules complémentaires**.
2. En haut à droite, cliquez sur les **trois points verticaux** (menu) et sélectionnez **Dépôts**.
3. Ajoutez l'URL de votre dépôt GitHub (ou l'URL fournie) :
   ```text
   https://github.com/florianfish/TeslaLocatorPG
   ```
4. Cliquez sur **Ajouter**, puis fermez la fenêtre.

### Étape 2 : Installer le module
1. Actualisez la boutique ou cherchez **Radios Françaises**.
2. Cliquez sur la carte du module **Radios Françaises**, puis cliquez sur **Installer**.
3. Patientez pendant le téléchargement et la compilation du conteneur.

---

## 2. Configuration

Dans l'onglet **Configuration** de l'Add-on :

| Option | Type | Par défaut | Description |
| :--- | :--- | :--- | :--- |
| `default_station` | liste | `europe-2` | Station par défaut au lancement (`europe-2`, `nrj`, `fun-radio`, `radio-fg`) |
| `log_level` | liste | `info` | Niveau de journalisation (`trace`, `debug`, `info`, `warning`, `error`) |

### Exemple de configuration :
```yaml
default_station: europe-2
log_level: info
```

---

## 3. Accès via Ingress (Barre latérale)

1. Dans l'onglet **Info** du module, activez les options :
   - ✅ **Lancer au démarrage**
   - ✅ **Surveiller** (Watchdog)
   - ✅ **Afficher dans la barre latérale**
2. Cliquez sur **Démarrer**.
3. Une nouvelle entrée **Radios FR** apparaît immédiatement dans votre barre latérale Home Assistant.
4. Cliquez dessus pour écouter la radio, voir les pochettes et les titres diffusés en direct !

---

## 4. Diffuser sur vos enceintes

Les flux audio sont diffusés en direct en formats MP3/AAC 128 kbps haute compatibilité. Vous pouvez les envoyer vers n'importe quelle entité `media_player` de votre Home Assistant (Google Nest, Sonos, Amazon Echo, HomePod, ESPHome, etc.).

### Flux directs :

| Station | Format | URL du Flux Direct |
| :--- | :--- | :--- |
| **Europe 2** | MP3 128 kbps | `https://europe2.lmn.fm/europe2.mp3` |
| **NRJ** | MP3 128 kbps | `https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3` |
| **Fun Radio** | MP3 128 kbps | `https://icecast.funradio.fr/fun-1-44-128?listen=webCwsAudioStream` |
| **Radio FG** | MP3 128 kbps | `https://radiofg.impek.com/fg` |

### Exemple d'automatisation (Réveil radio le matin sur Google Home) :
```yaml
alias: "Réveil - Europe 2 dans le salon"
trigger:
  - platform: time
    at: "07:00:00"
action:
  - action: media_player.play_media
    target:
      entity_id: media_player.enceinte_salon
    data:
      media_content_id: "https://europe2.lmn.fm/europe2.mp3"
      media_content_type: "music"
mode: single
```

---

## 5. Intégration Lovelace

### Exemple avec la carte populaire `mini-media-player` :
```yaml
type: custom:mini-media-player
entity: media_player.enceinte_salon
name: Radios Françaises
icon: mdi:radio
shortcuts:
  columns: 4
  buttons:
    - name: Europe 2
      icon: mdi:radio-tower
      type: service
      id: media_player.play_media
      data:
        entity_id: media_player.enceinte_salon
        media_content_id: "https://europe2.lmn.fm/europe2.mp3"
        media_content_type: "music"
    - name: NRJ
      icon: mdi:music
      type: service
      id: media_player.play_media
      data:
        entity_id: media_player.enceinte_salon
        media_content_id: "https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3"
        media_content_type: "music"
    - name: Fun Radio
      icon: mdi:party-popper
      type: service
      id: media_player.play_media
      data:
        entity_id: media_player.enceinte_salon
        media_content_id: "https://icecast.funradio.fr/fun-1-44-128?listen=webCwsAudioStream"
        media_content_type: "music"
    - name: Radio FG
      icon: mdi:disc
      type: service
      id: media_player.play_media
      data:
        entity_id: media_player.enceinte_salon
        media_content_id: "https://radiofg.impek.com/fg"
        media_content_type: "music"
```

---

## 6. Capteur REST pour afficher le titre en cours

Vous pouvez interroger l'Add-on pour afficher le titre actuellement diffusé sur votre dashboard Home Assistant !

Ajoutez dans votre `configuration.yaml` de Home Assistant :
```yaml
sensor:
  - platform: rest
    name: "Europe 2 Titre en cours"
    resource: "http://127.0.0.1:3000/api/radios/europe-2/now-playing"
    scan_interval: 20
    value_template: "{{ value_json.title }}"
    json_attributes:
      - artist
      - rawTitle
      - artworkUrl
```

---

## 7. Dépannage & FAQ

- **Pas de son dans Safari ou sur iPhone ?**
  Certains navigateurs mobiles bloquent la lecture automatique sans action de l'utilisateur. Cliquez sur le bouton central de lecture pour démarrer le flux.
- **Le module démarre-t-il après un redémarrage de la box / Raspberry Pi ?**
  Oui, veillez à cocher l'option **Lancer au démarrage** dans l'onglet Info du module.
