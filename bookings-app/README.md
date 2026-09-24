# NUMA Boekingen — Power Apps code app

Een mobiel-vriendelijke app om de boekingen van NUMA Nieuwpoort te beheren, rechtstreeks op de
Dataverse-tabel `gd_booking` (dezelfde tabel waar de publieke beschikbaarheidskalender uit leest).

**Wat kan je ermee?**

- **Overzicht in één oogopslag:** bezet of vrij vandaag, volgende aankomst, bezetting deze maand.
- **Lijst** van komende en afgelopen boekingen, per maand, met labels *Nu* en *Binnenkort*.
- **Kalender** in dezelfde kleurcodes als de publieke kalender. Tik op een bezette dag om de boeking
  te openen, of op een vrije dag om er een te starten.
- **Boeking toevoegen / wijzigen** met snelknoppen (1, 2, 3 of 7 nachten) en een **controle op
  overlap**: dubbele boekingen worden tegengehouden, wisseldagen (aankomst op de vertrekdag van een
  ander) zijn toegestaan.
- **Boeking annuleren:** de boeking wordt gedeactiveerd, niet verwijderd. Ze blijft dus in
  Dataverse staan en verdwijnt uit de kalender.
- **"Op je telefoon"-knop:** een QR-code en een stappenplan om de app op je beginscherm te zetten.

## Op je telefoon

Code apps draaien (nog) niet in de Power Apps mobiele app. Microsoft heeft dat op de roadmap staan,
maar zonder datum. Op je telefoon open je de app dus via de link in de browser en zet je hem op je
beginscherm. Daarna opent hij met één tik, net als een gewone app. Het stappenplan en de QR-code
staan in de app zelf achter de knop 📲 **Op je telefoon**.

## Installeren in je Power Platform-omgeving

Vereisten:

- Node.js 22 of hoger
- De Power Apps CLI: `npm install -g @microsoft/power-apps-cli` (commando `pa`)
- Code apps moeten aan staan in de omgeving. Dat zet een beheerder aan in het Power
  Platform-beheercentrum, bij de functie-instellingen van de omgeving.

Stappen, uit te voeren in deze map (`bookings-app/`):

```bash
npm install
pa auth login
pa app init --environment-id <jouw-omgevings-id> --display-name "NUMA Boekingen"
pa app add data-source --connector dataverse --table gd_booking
```

`pa app add data-source` genereert de getypeerde service onder `src/generated/`. Kijk daarna even in
`src/generated/models/Gd_bookingsModel.ts` of de kolomnamen overeenkomen met
[`src/config.ts`](src/config.ts). Vooral de naamkolom (`gd_name`) is een aanname; pas ze daar aan
als ze anders heten.

Lokaal testen tegen je echte data:

```bash
npm run dev
```

Open de **Local Play**-URL die in de terminal verschijnt, in hetzelfde browserprofiel waarmee je
bij Power Apps bent ingelogd.

Publiceren:

```bash
npm run build
pa app push
```

Deel de app daarna met je collega's zoals een gewone Power App. Zij hebben lees- en schrijfrechten
op de tabel `gd_booking` nodig.

## Demomodus

Wil je de app bekijken zonder Power Platform-omgeving? Gebruik dan `npm run dev:mock`. Die draait
met voorbeelddata en slaat niets op.

Opgelet: de app compileert pas nadat `pa app add data-source` de service onder `src/generated/`
heeft aangemaakt, ook in demomodus.

## Opbouw

```
src/
├── config.ts             # Dataverse-kolomnamen
├── data/                 # Dataverse-koppeling (dataverseRepo) + demodata (mockRepo)
├── hooks/                # useBookings (laden/opslaan), useAppInfo (gebruiker + app-link)
├── lib/dates.ts          # datumhulp, nachten, overlapcontrole
├── components/           # Summary, BookingList, CalendarView, BookingForm, PhoneSheet, Sheet
└── generated/            # door `pa` gegenereerd (niet in git)
```

Datums worden als pure kalenderdagen (`YYYY-MM-DD`) gelezen en geschreven, zonder tijdzone. Zo
schuift een boeking nooit een dag op.
