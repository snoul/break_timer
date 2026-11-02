# BRAKE TIMER (Wersja 1.1)

Minimalistyczna aplikacja internetowa stworzona z myślą o zdrowiu i profilaktyce siedzącego trybu życia. Jej głównym celem nie jest tradycyjna „produktywność”, lecz regularne robienie krótkich przerw zdrowotnych (**movement snacks**) na spacer lub ćwiczenia rozluźniające spięte mięśnie i pobudzające krążenie.

## Najważniejsze funkcje

- **Zdrowotne interwały ruchu:** Domyślnie skonfigurowana pod sesje pracy siedzącej (40 min) przerywane aktywnymi przerwami.
- **Dwa tryby przerw:**
  - **Odliczanie do zera:** Precyzyjnie zdefiniowany czas na szybkie rozciąganie lub krótką przerwę (z możliwością dodawania czasu w locie przyciskami `+2 min` i `+5 min`).
  - **Tryb stopera (0 min):** Liczy czas od zera w górę, idealny na dłuższą przerwę lub spacer.
- **Elastyczna konfiguracja i presety:**
  - *Czas pracy:* Szybki wybór spośród presetów **30 min, 40 min (domyślny) oraz 55 min** lub ręczne wprowadzanie czasu z dokładnością do 1 sekundy.
  - *Czas przerwy:* Szybki wybór presetów (0 min stoper, 2 min, 3 min, 5 min, 10 min) lub ręczne dostosowanie.
- **Płynna kontrola i intuicyjny interfejs:**
  - Czytelny wskaźnik postępu w formie okręgu SVG.
  - Przycisk **„Przerwa teraz”** widoczny w trakcie pracy, pozwalający przejść do przerwy przed upływem czasu.
  - Dynamicznie zmieniające się etykiety przycisków (np. **Reset** na ekranie startowym, **Zakończ** w trakcie pracy oraz ujednolicony **Koniec przerwy** podczas trwającej przerwy).
- **Optymalizacja pod ekrany AMOLED:** Całkowicie czarne tło (`#000000`) oszczędzające baterię, zoptymalizowane pod nowoczesne smartfony z uwzględnieniem bezpiecznych obszarów ekranu oraz spójnym, półprzezroczystym designem przycisków (*tint*).
- **Działanie w tle i powiadomienia:** Łagodny dźwięk alarmu (Web Audio API), wibracje, integracja z powiadomieniami systemowymi oraz blokada wygaszania ekranu (**Wake Lock**), co umożliwia bezproblemowe korzystanie z aplikacji na telefonie.