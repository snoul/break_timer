# BREAK TIMER v1.3

Minimalistyczna aplikacja internetowa (PWA) stworzona z myślą o zdrowiu i profilaktyce siedzącego trybu życia. Jej głównym celem nie jest tradycyjna „produktywność”, lecz regularne robienie krótkich przerw zdrowotnych (**movement snacks**) na spacer lub ćwiczenia rozluźniające spięte mięśnie i pobudzające krążenie.

## Najważniejsze funkcje w wersji 1.3

- **Zdrowotne interwały ruchu:** Domyślnie skonfigurowana pod sesje pracy siedzącej (40 min) przerywane aktywnymi przerwami.
- **Dwa tryby przerw:**
  - **Odliczanie do zera:** Precyzyjnie zdefiniowany czas na szybkie rozciąganie lub krótką przerwę (z możliwością dodawania czasu w locie przyciskami `+2 min` i `+5 min`).
  - **Tryb stopera (0 min):** Liczy czas od zera w górę, idealny na dłuższą przerwę lub spacer.
- **Elastyczna konfiguracja i presety:**
  - *Czas pracy:* Szybki wybór spośród presetów **30 min, 40 min (domyślny) oraz 55 min** lub ręczne wprowadzanie czasu z dokładnością do 1 sekundy (wsparte przyciskami szybkiej zmiany kroków `-5m` / `+5m`).
  - *Czas przerwy:* Szybki wybór presetów (**0 min stoper, 2 min, 3 min, 5 min, 10 min**) lub ręczne dostosowanie czasu z użyciem przycisków korekty co 30 sekund (`-30s` / `+30s`).
- **Nowa logika stanów alarmowych i powrotu do pracy:**
  - Po zakończeniu pracy aplikacja wyświetla komunikat **KONIEC CZASU PRACY!** z opcją przejścia do przerwy lub pominięcia.
  - Po zakończeniu przerwy aplikacja wyświetla komunikat **KONIEC PRZERWY!** i czeka na decyzję użytkownika: możliwość ponowienia przerwy przyciskiem **PONÓW** lub zatwierdzenia powrotu do pracy.
- **Płynna kontrola i intuicyjny interfejs:**
  - Czytelny wskaźnik postępu w formie okręgu SVG.
  - Przycisk **„Przerwa teraz”** widoczny w trakcie pracy, pozwalający przejść do przerwy przed upływem czasu.
- **Optymalizacja pod ekrany AMOLED:** Całkowicie czarny motyw (`#000000`) oszczędzający baterię, spójny, półprzezroczysty design przycisków (*tint*) o podwyższonym nasyceniu dla lepszej widoczności oraz obsługa bezpiecznych obszarów ekranu.
- **Wsparcie PWA i personalizacja systemu:**
  - Gotowa konfiguracja manifestu z obsługą elastycznych ikon (`any maskable` w rozmiarach 192x192 oraz 512x512 px) dedykowana na pulpit smartfonów.
  - Działanie w tle, łagodny dźwięk alarmu (Web Audio API), wibracje oraz blokada wygaszania ekranu (**Wake Lock**).