(function () {
  'use strict';

  
  const PREFIKSAS = '+370 ';

  function tikrintiRaides(laukas, kam, kaip) {
    const tekstas = laukas.value.trim();
    if (tekstas === '') {
      return 'Įveskite ' + kam + '.';
    }
    if (!/^\p{L}+$/u.test(tekstas)) {
      return kaip + ' gali sudaryti tik raidės.';
    }
    return '';
  }

  function tikrintiElPasta(laukas) {
    const tekstas = laukas.value.trim();
    if (tekstas === '') {
      return 'Įveskite el. pašto adresą.';
    }
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(tekstas)) {
      return 'Neteisingas el. pašto formatas (pvz., vardas@pastas.lt).';
    }
    return '';
  }

  function tikrintiTelefona(laukas) {
    const skaitmenys = paimtiVietosSkaitmenis(laukas.value);
    if (skaitmenys.length === 0) {
      return 'Įveskite telefono numerį.';
    }
    if (skaitmenys.length < 8) {
      return 'Numerį turi sudaryti 8 skaitmenys (pvz., +370 612 34567).';
    }
    return '';
  }

  function tikrintiAdresa(laukas) {
    if (laukas.value.trim() === '') {
      return 'Įveskite adresą.';
    }
    return '';
  }

  function tikrintiIvertinima(laukas) {
    const tekstas = laukas.value.trim();
    if (tekstas === '' && !laukas.validity.badInput) {
      return 'Įveskite įvertinimą nuo 1 iki 10.';
    }
    if (laukas.validity.badInput || !/^(10|[1-9])$/.test(tekstas)) {
      return 'Įvertinimas turi būti sveikasis skaičius nuo 1 iki 10.';
    }
    return '';
  }

  function paimtiVietosSkaitmenis(reiksme) {
    let skaitmenys = reiksme.replace(/\D/g, '');
    if (skaitmenys.startsWith('370')) {
      skaitmenys = skaitmenys.slice(3);
    } else if (skaitmenys.startsWith('8')) {
      skaitmenys = skaitmenys.slice(1);
    }
    if (skaitmenys.charAt(0) !== '6') {
      return '';
    }
    return skaitmenys.slice(0, 8);
  }

  function sudetiNumeri(skaitmenys, laukasAktyvus) {
    if (skaitmenys === '') {
      return laukasAktyvus ? PREFIKSAS : '';
    }
    let rezultatas = PREFIKSAS + skaitmenys.slice(0, 3);
    if (skaitmenys.length > 3) {
      rezultatas += ' ' + skaitmenys.slice(3);
    }
    return rezultatas;
  }

  function formatuotiTelefona(laukas, ivykis) {
    const buvusi = laukas.dataset.buvusi || '';
    const zymeklis = laukas.selectionStart === null ? laukas.value.length : laukas.selectionStart;
    let pozicija = laukas.value.slice(0, zymeklis).replace(/\D/g, '').length;
    let skaitmenys = laukas.value.replace(/\D/g, '');

    if (skaitmenys.startsWith('370')) {
      skaitmenys = skaitmenys.slice(3);
      pozicija = Math.max(0, pozicija - 3);
    } else if (skaitmenys.startsWith('8')) {
      skaitmenys = skaitmenys.slice(1);
      pozicija = Math.max(0, pozicija - 1);
    }
    if (skaitmenys.charAt(0) !== '6') {
      skaitmenys = '';
      pozicija = 0;
    }
    skaitmenys = skaitmenys.slice(0, 8);
    pozicija = Math.min(pozicija, skaitmenys.length);

    const aktyvus = document.activeElement === laukas;
    let rezultatas = sudetiNumeri(skaitmenys, aktyvus);

    if (rezultatas === buvusi && ivykis && skaitmenys !== '') {
      if (ivykis.inputType === 'deleteContentBackward' && pozicija > 0) {
        skaitmenys = skaitmenys.slice(0, pozicija - 1) + skaitmenys.slice(pozicija);
        pozicija -= 1;
      } else if (ivykis.inputType === 'deleteContentForward') {
        skaitmenys = skaitmenys.slice(0, pozicija) + skaitmenys.slice(pozicija + 1);
      }
      rezultatas = sudetiNumeri(skaitmenys, aktyvus);
    }

    laukas.value = rezultatas;
    laukas.dataset.buvusi = rezultatas;

    if (aktyvus) {
      let indeksas = PREFIKSAS.length;
      let suskaiciuota = 0;
      while (indeksas < rezultatas.length && suskaiciuota < pozicija) {
        if (rezultatas.charAt(indeksas) !== ' ') {
          suskaiciuota += 1;
        }
        indeksas += 1;
      }
      laukas.setSelectionRange(indeksas, indeksas);
    }
  }

  function paruostiKontaktuForma() {
    const forma = document.getElementById('kontaktu-forma');
    if (!forma) {
      return;
    }

    const siustiMygtukas = document.getElementById('siusti');
    const isvalytiMygtukas = document.getElementById('isvalyti');
    const rezultatoBlokas = document.getElementById('form-rezultatas');

    const laukai = [
      { id: 'vardas', tikrinti: (l) => tikrintiRaides(l, 'vardą', 'Vardą') },
      { id: 'pavarde', tikrinti: (l) => tikrintiRaides(l, 'pavardę', 'Pavardę') },
      { id: 'elpastas', tikrinti: tikrintiElPasta },
      { id: 'telefonas', tikrinti: tikrintiTelefona },
      { id: 'adresas', tikrinti: tikrintiAdresa },
      { id: 'ivertinimas1', tikrinti: tikrintiIvertinima },
      { id: 'ivertinimas2', tikrinti: tikrintiIvertinima },
      { id: 'ivertinimas3', tikrinti: tikrintiIvertinima }
    ].map((apibrezimas) => ({
      elementas: document.getElementById(apibrezimas.id),
      klaidosVieta: document.getElementById(apibrezimas.id + '-klaida'),
      tikrinti: apibrezimas.tikrinti
    }));

    function rodytiBusena(laukas, klaida) {
      laukas.klaidosVieta.textContent = klaida;
      laukas.elementas.classList.toggle('kf-invalid', klaida !== '');
      laukas.elementas.classList.toggle('kf-valid', klaida === '');
      laukas.elementas.setAttribute('aria-invalid', klaida !== '' ? 'true' : 'false');
    }

    function slepitiBusena(laukas) {
      laukas.klaidosVieta.textContent = '';
      laukas.elementas.classList.remove('kf-invalid', 'kf-valid');
      laukas.elementas.removeAttribute('aria-invalid');
    }

    function arFormaTinkama() {
      return laukai.every((laukas) => laukas.tikrinti(laukas.elementas) === '');
    }

    function atnaujintiMygtuka() {
      siustiMygtukas.disabled = !arFormaTinkama();
    }

    function surinktiDuomenis() {
      return {
        vardas: document.getElementById('vardas').value.trim(),
        pavarde: document.getElementById('pavarde').value.trim(),
        elPastas: document.getElementById('elpastas').value.trim(),
        telefonas: document.getElementById('telefonas').value.trim(),
        adresas: document.getElementById('adresas').value.trim(),
        ivertinimai: [
          Number(document.getElementById('ivertinimas1').value),
          Number(document.getElementById('ivertinimas2').value),
          Number(document.getElementById('ivertinimas3').value)
        ]
      };
    }

    function skaiciuotiVidurki(skaiciai) {
      const suma = skaiciai.reduce((rezultatas, skaicius) => rezultatas + skaicius, 0);
      return suma / skaiciai.length;
    }

    function pridetiEilute(tevas, pavadinimas, reiksme) {
      const eilute = document.createElement('p');
      eilute.textContent = pavadinimas + ': ' + reiksme;
      tevas.appendChild(eilute);
    }

    function parodytiRezultata(duomenys) {
      const vidurkis = skaiciuotiVidurki(duomenys.ivertinimai);

      rezultatoBlokas.replaceChildren();

      const antraste = document.createElement('h4');
      antraste.textContent = 'Pateikti duomenys';
      rezultatoBlokas.appendChild(antraste);

      pridetiEilute(rezultatoBlokas, 'Vardas', duomenys.vardas);
      pridetiEilute(rezultatoBlokas, 'Pavardė', duomenys.pavarde);
      pridetiEilute(rezultatoBlokas, 'El. paštas', duomenys.elPastas);
      pridetiEilute(rezultatoBlokas, 'Tel. Numeris', duomenys.telefonas);
      pridetiEilute(rezultatoBlokas, 'Adresas', duomenys.adresas);
      pridetiEilute(rezultatoBlokas, '1 klausimo įvertinimas', duomenys.ivertinimai[0]);
      pridetiEilute(rezultatoBlokas, '2 klausimo įvertinimas', duomenys.ivertinimai[1]);
      pridetiEilute(rezultatoBlokas, '3 klausimo įvertinimas', duomenys.ivertinimai[2]);

      const vidurkioEilute = document.createElement('p');
      vidurkioEilute.className = 'kf-vidurkis';
      vidurkioEilute.textContent = duomenys.vardas + ' ' + duomenys.pavarde + ': ' + vidurkis.toFixed(1);
      rezultatoBlokas.appendChild(vidurkioEilute);

      rezultatoBlokas.hidden = false;
    }

    function isvalytiForma() {
      forma.reset();
      laukai.forEach((laukas) => {
        slepitiBusena(laukas);
        delete laukas.elementas.dataset.buvusi;
      });
      rezultatoBlokas.replaceChildren();
      rezultatoBlokas.hidden = true;
      atnaujintiMygtuka();
    }

    laukai.forEach((laukas) => {
      const elementas = laukas.elementas;

      elementas.addEventListener('input', (ivykis) => {
        if (elementas.id === 'telefonas') {
          formatuotiTelefona(elementas, ivykis);
          if (laukas.tikrinti(elementas) !== '') {
            slepitiBusena(laukas);
            atnaujintiMygtuka();
            return;
          }
        }
        rodytiBusena(laukas, laukas.tikrinti(elementas));
        atnaujintiMygtuka();
      });

      elementas.addEventListener('blur', () => {
        if (elementas.id === 'telefonas' && paimtiVietosSkaitmenis(elementas.value) === '') {
          elementas.value = '';
          elementas.dataset.buvusi = '';
        }
        rodytiBusena(laukas, laukas.tikrinti(elementas));
        atnaujintiMygtuka();
      });
    });

    const telefonas = document.getElementById('telefonas');

    telefonas.addEventListener('focus', () => {
      if (telefonas.value === '') {
        telefonas.value = PREFIKSAS;
        telefonas.dataset.buvusi = PREFIKSAS;
      }
      telefonas.setSelectionRange(telefonas.value.length, telefonas.value.length);
    });

    function apsaugotiPrefiksa() {
      if (
        telefonas.value !== '' &&
        telefonas.selectionStart === telefonas.selectionEnd &&
        telefonas.selectionStart < PREFIKSAS.length
      ) {
        telefonas.setSelectionRange(PREFIKSAS.length, PREFIKSAS.length);
      }
    }
    telefonas.addEventListener('click', apsaugotiPrefiksa);
    telefonas.addEventListener('keyup', apsaugotiPrefiksa);

    forma.addEventListener('submit', (ivykis) => {
      ivykis.preventDefault();

      if (!arFormaTinkama()) {
        laukai.forEach((laukas) => rodytiBusena(laukas, laukas.tikrinti(laukas.elementas)));
        atnaujintiMygtuka();
        return;
      }

      const duomenys = surinktiDuomenis();
      console.log(duomenys);
      parodytiRezultata(duomenys);
    });

    isvalytiMygtukas.addEventListener('click', isvalytiForma);

    atnaujintiMygtuka();
  }

  
  const BUSENOS = ['Planuojama', 'Mokomasi', 'Atlikta'];

  const LYGIAI = [
    { lygis: 1, nuo: 0, rangas: 'Pradedantysis' },
    { lygis: 2, nuo: 50, rangas: 'Praktikantas' },
    { lygis: 3, nuo: 150, rangas: 'Specialistas' },
    { lygis: 4, nuo: 300, rangas: 'Profesionalas' }
  ];

  const SAUGYKLOS_RAKTAS = 'cvIgudziuBusenos';

  const igudziai = [
    { id: 'relinesApsauga', pavadinimas: 'Relinė apsauga', busena: 'Planuojama', xp: 60, ikona: 'shield-check' },
    { id: 'scada', pavadinimas: 'SCADA ir automatizacija', busena: 'Planuojama', xp: 50, ikona: 'cpu' },
    { id: 'saulesElektrines', pavadinimas: 'Saulės elektrinių projektavimas', busena: 'Mokomasi', xp: 70, ikona: 'sun' },
    { id: 'energijosKaupimas', pavadinimas: 'Energijos kaupimo sistemos', busena: 'Mokomasi', xp: 40, ikona: 'battery-charging' },
    { id: 'grandiniuAnalize', pavadinimas: 'Elektros grandinių analizė', busena: 'Atlikta', xp: 80, ikona: 'lightning-charge' },
    { id: 'autocad', pavadinimas: 'AutoCAD schemų braižymas', busena: 'Atlikta', xp: 70, ikona: 'pencil-square' },
    { id: 'matlab', pavadinimas: 'MATLAB skaičiavimai', busena: 'Atlikta', xp: 50, ikona: 'graph-up' },
    { id: 'excel', pavadinimas: 'Excel duomenų apdorojimas', busena: 'Atlikta', xp: 40, ikona: 'table' }
  ];

  function issaugotiBusenas() {
    const busenos = {};
    igudziai.forEach((igudis) => {
      busenos[igudis.id] = igudis.busena;
    });
    try {
      localStorage.setItem(SAUGYKLOS_RAKTAS, JSON.stringify(busenos));
    } catch (klaida) {
      console.warn('Nepavyko išsaugoti būsenų vietinėje saugykloje.', klaida);
    }
  }

  function ikeltiBusenas() {
    let issaugota = null;
    try {
      issaugota = JSON.parse(localStorage.getItem(SAUGYKLOS_RAKTAS));
    } catch (klaida) {
      issaugota = null;
    }
    if (!issaugota || typeof issaugota !== 'object') {
      return;
    }
    igudziai.forEach((igudis) => {
      if (BUSENOS.includes(issaugota[igudis.id])) {
        igudis.busena = issaugota[igudis.id];
      }
    });
  }

  function skaiciuotiXP() {
    return igudziai
      .filter((igudis) => igudis.busena === 'Atlikta')
      .reduce((suma, igudis) => suma + igudis.xp, 0);
  }

  function nustatytiLygi(xp) {
    let dabartinis = LYGIAI[0];
    LYGIAI.forEach((lygis) => {
      if (xp >= lygis.nuo) {
        dabartinis = lygis;
      }
    });
    return dabartinis;
  }

  function skaiciuotiProgresa(xp, lygis) {
    const sekantis = LYGIAI.find((elementas) => elementas.lygis === lygis.lygis + 1);
    if (!sekantis) {
      return 100;
    }
    return Math.round(((xp - lygis.nuo) / (sekantis.nuo - lygis.nuo)) * 100);
  }

  function sukurtiKortele(igudis) {
    const kortele = document.createElement('article');
    kortele.className = 'kp-card';
    kortele.dataset.id = igudis.id;

    const ikona = document.createElement('span');
    ikona.className = 'kp-card__icon';
    const ikonosZyme = document.createElement('i');
    ikonosZyme.className = 'bi bi-' + igudis.ikona;
    ikona.appendChild(ikonosZyme);

    const turinys = document.createElement('div');
    turinys.className = 'kp-card__content';

    const pavadinimas = document.createElement('h4');
    pavadinimas.textContent = igudis.pavadinimas;

    const meta = document.createElement('div');
    meta.className = 'kp-card__meta';

    const xp = document.createElement('span');
    xp.className = 'kp-xp';
    xp.textContent = 'XP: ' + igudis.xp;

    const pasirinkimas = document.createElement('select');
    pasirinkimas.className = 'kp-select';
    pasirinkimas.setAttribute('aria-label', 'Keisti įgūdžio „' + igudis.pavadinimas + '“ būseną');
    BUSENOS.forEach((busena) => {
      const variantas = document.createElement('option');
      variantas.value = busena;
      variantas.textContent = busena;
      variantas.selected = busena === igudis.busena;
      pasirinkimas.appendChild(variantas);
    });

    meta.append(xp, pasirinkimas);
    turinys.append(pavadinimas, meta);
    kortele.append(ikona, turinys);
    return kortele;
  }

  function atvaizduotiLenta() {
    BUSENOS.forEach((busena) => {
      const stulpelis = document.querySelector('.kp-column__body[data-busena="' + busena + '"]');
      const skaitiklis = document.querySelector('.kp-count[data-skaicius="' + busena + '"]');
      const stulpelioIgudziai = igudziai.filter((igudis) => igudis.busena === busena);

      stulpelis.replaceChildren();

      if (stulpelioIgudziai.length === 0) {
        const tuscia = document.createElement('p');
        tuscia.className = 'kp-empty';
        tuscia.textContent = 'Šioje kategorijoje įgūdžių nėra.';
        stulpelis.appendChild(tuscia);
      } else {
        stulpelioIgudziai.forEach((igudis) => stulpelis.appendChild(sukurtiKortele(igudis)));
      }

      skaitiklis.textContent = stulpelioIgudziai.length;
    });
  }

  function atnaujintiXPLygiIrRanga(xp, lygis) {
    document.getElementById('xp-viso').textContent = xp + ' XP';
    document.getElementById('lygis').textContent = lygis.lygis;
    document.getElementById('rangas').textContent = lygis.rangas;

    document.querySelectorAll('.kp-levels li').forEach((elementas) => {
      elementas.classList.toggle('is-current', Number(elementas.dataset.lygis) === lygis.lygis);
    });
  }

  function atnaujintiProgresoJuosta(xp, lygis) {
    const procentai = skaiciuotiProgresa(xp, lygis);
    const sekantis = LYGIAI.find((elementas) => elementas.lygis === lygis.lygis + 1);

    document.getElementById('progresas-tekstas').textContent = sekantis
      ? xp + ' / ' + sekantis.nuo + ' XP'
      : xp + ' XP (aukščiausias lygis)';

    const juosta = document.getElementById('progresas-juosta');
    juosta.setAttribute('aria-valuenow', procentai);

    document.getElementById('progresas-pildymas').style.width = procentai + '%';
    document.getElementById('progresas-procentas').textContent = procentai >= 12 ? procentai + ' %' : '';
  }

  function atnaujintiStatistika() {
    const viso = igudziai.length;
    const atlikta = igudziai.filter((igudis) => igudis.busena === 'Atlikta').length;
    const procentai = viso === 0 ? 0 : Math.round((atlikta / viso) * 100);

    document.getElementById('stat-viso').textContent = viso;
    document.getElementById('stat-atlikta').textContent = atlikta;
    document.getElementById('stat-procentas').textContent = procentai + ' %';
  }

  function perskaiciuotiModuli() {
    const xp = skaiciuotiXP();
    const lygis = nustatytiLygi(xp);

    atvaizduotiLenta();
    atnaujintiXPLygiIrRanga(xp, lygis);
    atnaujintiProgresoJuosta(xp, lygis);
    atnaujintiStatistika();
  }

  function keistiBusena(id, naujaBusena) {
    const igudis = igudziai.find((elementas) => elementas.id === id);
    if (!igudis || !BUSENOS.includes(naujaBusena) || igudis.busena === naujaBusena) {
      return;
    }

    igudis.busena = naujaBusena;
    issaugotiBusenas();
    perskaiciuotiModuli();

    const pasirinkimas = document.querySelector('.kp-card[data-id="' + id + '"] .kp-select');
    if (pasirinkimas) {
      pasirinkimas.closest('.kp-card').classList.add('kp-card--moved');
      pasirinkimas.focus({ preventScroll: true });
    }
  }

  function paruostiKompetencijuModuli() {
    const lenta = document.getElementById('igudziu-lenta');
    if (!lenta) {
      return;
    }

    ikeltiBusenas();
    perskaiciuotiModuli();

    lenta.addEventListener('change', (ivykis) => {
      if (!ivykis.target.classList.contains('kp-select')) {
        return;
      }
      const kortele = ivykis.target.closest('.kp-card');
      keistiBusena(kortele.dataset.id, ivykis.target.value);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    paruostiKontaktuForma();
    paruostiKompetencijuModuli();
  });
})();
