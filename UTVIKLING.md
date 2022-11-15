# Utvklingsnotater Fintech Enigma API

### Scrape Fantacy Fond

- Har laget et [program](./modules/DNscrape.js) som scraper fondet vårt på fantacyfond DN, usikker på om det vil virke på en hostet server. (Må sjekkes)

    * NS - 23.10.22

### Data fra DN fantacy Fond - Plan

- Lage et eget program med google firebase som kjører hver time mellom kl 09:00 og 17:00 (man-fre) og oppdaterer prisene på fondet. Dette blir så lagret i en firebase database. 

- Programmet i Firebase og denne API'en skal være urelaterte. 

- Her på serveren skal så den dataen hentes fra Firebase databasen for å så parses og sendes til client. 

- Vi henter i fra https://investor.dn.no/FantasyFunds/LeagueFundList?leagueId=971. 

- Skal forsøke å gjøre det med ren JS s.a. vi slipper å bruke firebase, men mistenker det kan bli vanskelig. 

    * NS - 15.11.22