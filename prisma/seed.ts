import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Cleanup
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();

  // ─── Hauptkategorien ───
  const werkstoffkunde = await prisma.category.create({
    data: {
      title: "Werkstoffkunde",
      slug: "werkstoffkunde",
      description:
        "Alles rund um Papier, Karton, Pappe und weitere Packstoffe.",
      image:
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=1200&q=80",
      position: 0,
    },
  });

  const druckverfahren = await prisma.category.create({
    data: {
      title: "Druckverfahren",
      slug: "druckverfahren",
      description:
        "Offset-, Flexo-, Digital- und Tiefdruck für Verpackungen.",
      image:
        "https://images.unsplash.com/photo-1504711434969-e33886168d9c?w=1200&q=80",
      position: 1,
    },
  });

  const verpackungstechnik = await prisma.category.create({
    data: {
      title: "Verpackungstechnik",
      slug: "verpackungstechnik",
      description:
        "Konstruktion, Stanzformen und maschinelle Verarbeitung.",
      image:
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80",
      position: 2,
    },
  });

  const qualitaetssicherung = await prisma.category.create({
    data: {
      title: "Qualitätssicherung",
      slug: "qualitaetssicherung",
      description:
        "Prüfverfahren, Normen und Qualitätsmanagement.",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
      position: 3,
    },
  });

  const pruefungsvorbereitung = await prisma.category.create({
    data: {
      title: "Prüfungsvorbereitung",
      slug: "pruefungsvorbereitung",
      description:
        "Übungsaufgaben und Zusammenfassungen für die Abschlussprüfung.",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",
      position: 4,
    },
  });

  const nachhaltigkeit = await prisma.category.create({
    data: {
      title: "Nachhaltigkeit & Recycling",
      slug: "nachhaltigkeit-recycling",
      description:
        "Umweltschutz, Recycling-Kreisläufe und nachhaltige Verpackungen.",
      image:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80",
      position: 5,
    },
  });

  // ─── Unterkategorien ───
  const papierherstellung = await prisma.category.create({
    data: {
      title: "Papierherstellung",
      slug: "papierherstellung",
      parentId: werkstoffkunde.id,
      description: "Vom Holz zum fertigen Papier – der Herstellungsprozess.",
      image:
        "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=1200&q=80",
      position: 0,
    },
  });

  const wellpappe = await prisma.category.create({
    data: {
      title: "Wellpappe",
      slug: "wellpappe",
      parentId: werkstoffkunde.id,
      description: "Aufbau, Wellenarten und Eigenschaften von Wellpappe.",
      image:
        "https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=1200&q=80",
      position: 1,
    },
  });

  await prisma.category.create({
    data: {
      title: "Offsetdruck",
      slug: "offsetdruck",
      parentId: druckverfahren.id,
      description: "Das meistverwendete Druckverfahren in der Verpackungsindustrie.",
      image:
        "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=1200&q=80",
      position: 0,
    },
  });

  await prisma.category.create({
    data: {
      title: "Flexodruck",
      slug: "flexodruck",
      parentId: druckverfahren.id,
      description: "Hochdruck für flexible Verpackungen und Wellpappe.",
      image:
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80",
      position: 1,
    },
  });

  // ─── Posts ───
  await prisma.post.create({
    data: {
      title: "Grundlagen der Papierherstellung",
      slug: "grundlagen-papierherstellung",
      description:
        "Ein Überblick über den Weg vom Rohstoff zum fertigen Papier.",
      content: `# Grundlagen der Papierherstellung

## Der Rohstoff Holz
Papier wird überwiegend aus Holz hergestellt. Dabei unterscheidet man zwischen **Nadelholz** (lange Fasern, hohe Festigkeit) und **Laubholz** (kurze Fasern, glatte Oberfläche).

:::merke
Die Wahl des Rohstoffs bestimmt maßgeblich die Eigenschaften des fertigen Papiers. Nadelholz = Festigkeit, Laubholz = Glätte.
:::

## Der Herstellungsprozess

### 1. Holzaufbereitung
Das Holz wird entrindet, zerkleinert und zu **Holzschliff** oder **Zellstoff** verarbeitet.

### 2. Stoffaufbereitung
Der Faserbrei wird gereinigt, gemahlen und mit Füllstoffen sowie Leimstoffen versetzt.

### 3. Papiermaschine
Auf dem Sieb wird die Fasersuspension entwässert. In der Pressenpartie wird weiteres Wasser ausgepresst. Die Trockenpartie trocknet das Papier abschließend.

:::tipp
Eine Eselsbrücke: **S**ieb → **S**iebseite (die rauere Seite). Die Filzseite ist immer die glattere.
:::

## Wichtige Begriffe

- **Grammatur**: Gewicht in g/m²
- **Laufrichtung**: Maschinenrichtung der Fasern
- **Siebseite / Filzseite**: Ober- und Unterseite des Papiers

+++Was genau ist die Laufrichtung?
Die Laufrichtung (auch Maschinenrichtung) gibt an, in welche Richtung sich die Fasern bei der Herstellung auf der Papiermaschine ausrichten. Sie beeinflusst das Falz-, Reiß- und Dehnverhalten des Papiers. Man unterscheidet Schmalbahn (SB) und Breitbahn (BB).
+++

+++Warum ist die Grammatur wichtig?
Die Grammatur gibt das Flächengewicht in g/m² an. Sie bestimmt die Dicke, Steifigkeit und Bedruckbarkeit. Papier: bis 150 g/m², Karton: 150–600 g/m², Pappe: ab 600 g/m².
+++

:::warnung
Die Laufrichtung muss beim Zuschnitt immer beachtet werden! Falsches Schneiden führt zu Rissen beim Falzen.
:::

## Wissen testen

???Aus welchem Rohstoff wird Papier hauptsächlich hergestellt?
[ ] Baumwolle
[x] Holz
[ ] Bambus
[ ] Altpapier
>>>Holz ist der wichtigste Rohstoff. Altpapier wird beim Recycling verwendet, ist aber kein Primärrohstoff.
???

???Welche Holzart liefert längere Fasern und höhere Festigkeit?
[x] Nadelholz
[ ] Laubholz
[ ] Tropenholz
>>>Nadelholz (z.B. Fichte, Kiefer) hat lange Fasern von 2-4mm, die dem Papier Festigkeit verleihen.
???
`,
      editorType: "MARKDOWN",
      categoryId: papierherstellung.id,
      coverImage:
        "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=1200&q=80",
      published: true,
      position: 0,
    },
  });

  await prisma.post.create({
    data: {
      title: "Wellenarten und ihre Eigenschaften",
      slug: "wellenarten-eigenschaften",
      description:
        "Die verschiedenen Wellenarten von A-Welle bis F-Welle im Vergleich.",
      content: `# Wellenarten bei Wellpappe

## Übersicht der Wellenarten

| Welle | Höhe (mm) | Teilung (mm) | Einsatz |
|-------|-----------|--------------|---------|
| A-Welle | 4,0–5,0 | 8,0–9,5 | Hohe Polsterung |
| B-Welle | 2,2–3,0 | 5,5–6,5 | Gute Bedruckbarkeit |
| C-Welle | 3,2–3,9 | 6,8–7,9 | Allrounder |
| E-Welle | 1,0–1,8 | 3,0–3,5 | Faltschachteln |
| F-Welle | 0,6–0,9 | 1,9–2,6 | Feinwelle |

## A-Welle (Grobwelle)
Die A-Welle bietet die **höchste Polsterwirkung** und wird vor allem für empfindliche Güter eingesetzt.

## B-Welle (Feinwelle)
Durch die geringere Wellenhöhe eignet sich die B-Welle besonders für **hochwertige Bedruckung**.

## Kombinations-Wellpappe
Durch Kombination verschiedener Wellen (z.B. BC-Welle) können die Vorteile verschiedener Wellenarten vereint werden.
`,
      editorType: "MARKDOWN",
      categoryId: wellpappe.id,
      coverImage:
        "https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=1200&q=80",
      published: true,
      position: 0,
    },
  });

  await prisma.post.create({
    data: {
      title: "Verpackungsdesign: Von der Idee zur Stanzform",
      slug: "verpackungsdesign-stanzform",
      description: "Wie eine Verpackung konstruiert und als Stanzform umgesetzt wird.",
      content: `# Von der Idee zur Stanzform

## Der Konstruktionsprozess

### 1. Anforderungsanalyse
Welches Produkt soll verpackt werden? Welche Anforderungen gibt es an Schutz, Transport und Präsentation?

### 2. FEFCO-Codes
Die **FEFCO-Codes** sind internationale Standards für Verpackungskonstruktionen:
- **02xx**: Faltschachteln
- **03xx**: Deckelschachteln
- **04xx**: Falthüllen und Trays

### 3. CAD-Konstruktion
Mit spezieller Software wird die Verpackung konstruiert und als Stanzform ausgegeben.

## Wichtige Maße
- **Innenmaße**: Maße des Packguts + Zugabe
- **Rilllinien**: Vorgeprägte Faltlinien
- **Stanzkontur**: Schnittlinie für das Ausstanzen
`,
      editorType: "MARKDOWN",
      categoryId: verpackungstechnik.id,
      coverImage:
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80",
      published: true,
      position: 0,
    },
  });

  await prisma.post.create({
    data: {
      title: "Prüfverfahren für Karton und Pappe",
      slug: "pruefverfahren-karton-pappe",
      description: "Die wichtigsten Prüfmethoden in der Qualitätssicherung.",
      content: `# Prüfverfahren für Karton und Pappe

## Mechanische Prüfungen

### Berstdruckprüfung (Mullen-Test)
Misst den **Druck**, der nötig ist, um das Material zum Bersten zu bringen. Einheit: kPa.

### Durchstoßprüfung
Bestimmt die **Widerstandsfähigkeit** gegen punktuelle Belastung.

### ECT (Edge Crush Test)
Misst die **Kantenstauchwiderstand** von Wellpappe – wichtig für die Stapelfähigkeit.

## Optische Prüfungen
- **Weißgrad**: Messung mit Spektralphotometer
- **Opazität**: Lichtundurchlässigkeit
- **Glätte**: Bekk- oder Bendtsen-Methode

## Feuchtigkeitsprüfungen
- **Cobb-Test**: Wasseraufnahme in g/m² nach 60 Sekunden
- **Feuchtigkeitsgehalt**: Trocknung und Wägung
`,
      editorType: "MARKDOWN",
      categoryId: qualitaetssicherung.id,
      coverImage:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
      published: true,
      position: 0,
    },
  });

  await prisma.post.create({
    data: {
      title: "Recycling von Wellpappe",
      slug: "recycling-wellpappe",
      description: "Der Kreislauf der Wellpappe: Vom Altpapier zum neuen Produkt.",
      content: `# Recycling von Wellpappe

## Der Recycling-Kreislauf

Wellpappe gehört zu den am **besten recycelbaren** Verpackungsmaterialien. Die Recyclingquote in Deutschland liegt bei über **90%**.

### Schritt 1: Sammlung
Altpapier wird gesammelt und sortiert.

### Schritt 2: Auflösung
Im **Pulper** wird das Altpapier in Wasser aufgelöst und zu einem Faserbrei verarbeitet.

### Schritt 3: Reinigung
Fremdkörper, Druckfarben und Klebstoffe werden entfernt.

### Schritt 4: Neuproduktion
Aus dem gereinigten Faserbrei wird neues Papier oder neue Wellpappe hergestellt.

## Grenzen des Recyclings
- Fasern verkürzen sich bei jedem Recycling-Durchlauf
- Nach ca. **6–7 Durchläufen** sind die Fasern zu kurz
- Frischfasern müssen beigemischt werden
`,
      editorType: "MARKDOWN",
      categoryId: nachhaltigkeit.id,
      coverImage:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80",
      published: true,
      position: 0,
    },
  });

  console.log("Seed erfolgreich! Daten wurden angelegt.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
