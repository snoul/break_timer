# BRAKE TIMER (Wersja 1.0)

Minimalistyczna aplikacja internetowa stworzona z myślą o zdrowiu i profilaktyce siedzącego trybu życia. Jej głównym celem nie jest tradycyjna „produktywność”, lecz regularne robienie krótkich przerw (**movement snacks**) na spacer lub ćwiczenia rozluźniające spięte mięśnie i pobudzające krążenie.

## Najważniejsze funkcje

- **Zdrowotne interwały ruchu:** Domyślnie skonfigurowana pod sesje pracy siedzącej (45 min) przerywane aktywnymi przerwami.
- **Dwa tryby przerw:**
  - **Odliczanie do zera:** Precyzyjnie zdefiniowany czas na szybkie rozciąganie lub krótką przerwę.
  - **Tryb stopera (0 min):** Liczy czas od zera w górę, dopóki sam nie zdecydujesz o powrocie do pracy (idealne na dłuższy spacer).
- **Elastyczna konfiguracja:** Wpisywanie czasu z dokładnością do 1 sekundy lub użycie wygodnych przycisków szybkiego wyboru:
  - *Praca:* 30 min, 45 min, 60 min (skok regulacji +/- 5 min).
  - *Przerwa:* 0 min (stoper), 2 min, 3 min, 5 min, 10 min (skok regulacji +/- 30 s).
- **Wizualny wskaźnik postępu:** Duży, czytelny okrąg SVG, którego obwód płynnie skraca się w miarę upływu czasu.
- **Pełna kontrola w locie:** Szybkie dodawanie czasu przyciskami (+2m, +5m) oraz dedykowany przycisk natychmiastowego przejścia do przerwy przed czasem.
- **Optymalizacja pod ekrany AMOLED:** Całkowicie czarne tło (`#000000`) oszczędzające baterię, zoptymalizowane pod nowoczesne smartfony (z uwzględnieniem bezpiecznych obszarów ekranu).
- **Powiadomienia i działanie w tle:** Dyskretny, łagodny gong (Web Audio API), wibracje oraz integracja z systemowymi powiadomieniami i blokadą wygaszania ekranu (Wake Lock), co pozwala na bezproblemowe korzystanie na telefonie z wygaszonym ekranem.