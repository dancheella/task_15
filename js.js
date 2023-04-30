let cities = [];
let person = [];
let specializations = [];

Promise.all(
  [
    fetch('cities.json'),
    fetch('person.json'),
    fetch('specializations.json'),
  ]
).then(async ([citiesResponse, personResponse, specializationsResponse]) => {
  const citiesJson = await citiesResponse.json();
  const personJson = await personResponse.json();
  const specializationsJson = await specializationsResponse.json();
  return [citiesJson, personJson, specializationsJson]
})
  .then(response => {
    cities = response[0];
    person = response[1];
    specializations = response[2];

    getInfo.call(person[0]);
    getInfoFigma();
    getReactDeveloper();
    checkAge();
    getBackendDevelopersFromMoscow();
    figmaAndPhotoshop();
    createTeam();
  });

function printPeopleInformation(people, hasSkillsLevel, hasRequest) {
  people.forEach(person => {
    console.log(`Имя: ${person.personal.firstName}`);
    console.log(`Фамилия: ${person.personal.lastName}`);
    if (person.skills && person.skills.length > 0) {
      console.log(`Навыки: `);
      person.skills.forEach(skill => {
        if (hasSkillsLevel) {
          console.log(`- ${skill.name} (${skill.level})`);
        } else {
          console.log(`- ${skill.name}`);
        }
      });
    }
    if (hasRequest && person.request && person.request.length > 0) {
      console.log(`Требования: `);
      person.request.forEach(req => {
        console.log(`${req.name} - ${req.value}`);
      });
    }
    console.log('--------');
  });
}

function getInfo() {
  const {firstName, lastName} = this.personal;
  let city = cities.find((city) => city.id === this.personal.locationId);

  if (city && city.name) {
    let location = city.name;
    console.log(firstName + ' ' + lastName + ', ' + location);
  } else {
    console.log('Не удалось найти город!');
  }
}

function getInfoFigma() {
  let designers = specializations.find(s => s.name.toLowerCase() === 'designer');
  if (designers) {
    let designersFigma = person.filter(p => {
      return p.personal.specializationId === designers.id;
    });
    printPeopleInformation(designersFigma, true, false);
    // // Нужно так, но хотел красивый ответ)
    // designersFigma.forEach(designer => {
    //   getInfo.call(designer);
    // });
  } else {
    console.log('Не удалось найти дизайнера, который владеет Figma');
  }
}

function getReactDeveloper() {
  let developer = person.find(p => p.skills.some(skill => skill.name.toLowerCase() === 'react'));
  if (developer) {
    getInfo.call(developer);
  } else {
    console.log('Не удалось найти разработчика, который владеет React');
  }
}

function checkAge() {
  let allOver18 = person.every(p => {
    let birthYear = new Date(p.personal.birthday).getFullYear();
    let currentYear = new Date().getFullYear();
    let age = currentYear - birthYear;
    return age > 18;
  });
  console.log('Все пользователи старше 18 лет: ' + allOver18);
}

function getBackendDevelopersFromMoscow() {
  let backendDevelopersFromMoscow = person.filter(p => {
    let isBackend = false;
    let hasValidSalaryReq = false;
    let hasValidEmploymentReq = false;
    let isLocatedInMoscow = false;

    // Проверяем, является ли специализация текущего элемента массива "backend"
    let specialization = specializations.find(s => s.id === p.personal.specializationId);
    if (specialization && specialization.name.toLowerCase() === 'backend') {
      isBackend = true;
    }

    // Проверяем, есть ли у текущего элемента массива запрос на зарплату и является ли он допустимым
    let salaryReq = p.request.find(req => req.name.toLowerCase() === 'зарплата');
    if (salaryReq && salaryReq.value >= 0) {
      hasValidSalaryReq = true;
    }

    // Проверяем, есть ли у текущего элемента массива запрос на тип занятости и является ли он "полная"
    let employmentReq = p.request.find(req => req.name.toLowerCase() === 'тип занятости');
    if (employmentReq && employmentReq.value.toLowerCase() === 'полная') {
      hasValidEmploymentReq = true;
    }

    // Проверяем, находится ли текущий элемент массива в Москве
    if (p.personal.locationId === 1) {
      isLocatedInMoscow = true;
    }

    // Проверяем все условия
    return isBackend && hasValidSalaryReq && hasValidEmploymentReq && isLocatedInMoscow;
  });

  backendDevelopersFromMoscow.sort((a, b) => {
    let aSalary = a.request.find(req => req.name.toLowerCase() === 'зарплата').value;
    let bSalary = b.request.find(req => req.name.toLowerCase() === 'зарплата').value;
    return aSalary - bSalary;
  });
  printPeopleInformation(backendDevelopersFromMoscow, false, true);
  // // Можно и так, но обратно захотел красивее))
  // backendDevelopersFromMoscow.forEach(backend => {
  //   getInfo.call(backend);
  // });
}

function figmaAndPhotoshop() {
  let designers = specializations.find(s => s.name.toLowerCase() === 'designer');
  if (designers) {
    let designersFigmaAndPhotoshop = person.filter(p => {
      // Можно расписать как в 6 пункте, просто думаю так проще
      return p.personal.specializationId === designers.id
        && p.skills.some(skill => skill.name.toLowerCase() === 'photoshop' && skill.level >= 6)
        && p.skills.some(skill => skill.name.toLowerCase() === 'figma' && skill.level >= 6);
    });
    printPeopleInformation(designersFigmaAndPhotoshop, true, false);
  } else {
    console.log('Не удалось найти дизайнера');
  }
}

function createTeam() {
  // находим лучшего дизайнера
  let designer;
  let highestFigmaLevel = 0;

  person.forEach(person => {
    let figmaSkill = person.skills.find(skill => skill.name === 'Figma');

    if (figmaSkill && figmaSkill.level > highestFigmaLevel) {
      designer = person;
      highestFigmaLevel = figmaSkill.level;
    }
  });
  console.log(designer);
  getInfo.call(designer);

  // находим лучшего frontend-разработчика
  let frontend;
  let frontLevel = 0;

  person.forEach(person => {
    let angularSkill = person.skills.find(skill => skill.name === 'Angular');

    if (angularSkill && angularSkill.level > frontLevel) {
      frontend = person;
      frontLevel = angularSkill.level;
    }
  });
  console.log(frontend);
  getInfo.call(frontend);

  // находим лучшего backend-разработчика на Go
  let backend;
  let backLevel = 0;

  person.forEach(person => {
    let goSkill = person.skills.find(skill => skill.name === 'Go');

    if (goSkill && goSkill.level > backLevel) {
      backend = person;
      backLevel = goSkill.level;
    }
  });
  console.log(backend);
  getInfo.call(backend);
}


