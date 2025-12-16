# Analisi Tecnica e Piano di Miglioramento - EMU Commercial Hub

Questo documento riassume le aree di miglioramento identificate nel codebase del progetto. Le criticità sono state suddivise per priorità per guidare futuri interventi di refactoring.

Le criticità ad alta priorità identificate come bloccanti sono già state corrette.

## Panoramica delle Criticità da Affrontare

### 1. Collo di Bottiglia: Tutta la logica è sul Client (`Dashboard.tsx`)

*   **Criticità:** Alta
*   **Impatto:** Performance. L'applicazione è destinata a diventare estremamente lenta o inutilizzabile con l'aumento dei dati.
*   **Descrizione:** Attualmente, la dashboard scarica l'intero contenuto delle tabelle `projects` e `profiles` ed esegue tutte le operazioni (filtri, ricerche, aggregazioni KPI) nel browser.
*   **Soluzione Proposta:**
    1.  **Spostare i Calcoli sul Backend:** Creare funzioni RPC (Remote Procedure Call) in Supabase per calcolare i dati aggregati (es. `get_pipeline_value`, `count_projects_won`). Il frontend dovrà solo chiamare queste funzioni e mostrare il risultato.
    2.  **Filtrare e Paginare i Dati via API:** Le query per ottenere la lista di progetti devono includere filtri, ordinamento e paginazione (es. `supabase.from('projects').select('*').ilike('client_name', '%...%').range(0, 20)`). In questo modo il client riceve solo i dati che deve visualizzare.

### 2. Monolite: Il Componente `Dashboard.tsx` è Troppo Grande

*   **Criticità:** Media
*   **Impatto:** Manutenibilità.
*   **Descrizione:** Il file `Dashboard.tsx` contiene la logica per tutta la pagina, rendendolo difficile da leggere e modificare.
*   **Soluzione Proposta:** Estrarre le sezioni della dashboard in componenti più piccoli e dedicati, ognuno con la propria responsabilità e nel proprio file.
    *   `VibeCheck.tsx`
    *   `KpiGrid.tsx`
    *   `ProjectsChart.tsx`
    *   `ProjectsTable.tsx`
    *   `ProjectSheet.tsx`

### 3. Codice "Sporco" e Pratiche da Migliorare

*   **Criticità:** Bassa
*   **Impatto:** Qualità del codice, Manutenibilità.
*   **Descrizione:**
    *   **`console.log` residui:** Il codice contiene molte istruzioni di logging usate per il debug.
    *   **`alert()` per errori:** L'interfaccia utente usa `alert()` per notificare gli errori, un'esperienza utente datata e bloccante.
    *   **Canali Realtime Multipli:** Vengono usati più canali realtime dove ne basterebbe uno.
    *   **Controllo ridondante in `App.tsx`:** La verifica delle variabili d'ambiente in `App.tsx` è ridondante dopo la correzione in `supabaseClient.ts`.
*   **Soluzione Proposta:**
    *   Rimuovere sistematicamente i `console.log`.
    *   Sostituire `alert()` con un sistema di notifiche "toast" (es. `react-hot-toast`).
    *   Unificare le sottoscrizioni realtime in un unico canale.
    *   Rimuovere il codice di fallback da `App.tsx`.
