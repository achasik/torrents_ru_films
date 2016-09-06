var async = require('asyncawait/async');
var await = require('asyncawait/await');
var kinopoisk = require('./kinopoisk');
var db = require('./dbAsync');

function assert(obj, property, expected) {
    console.assert(obj[property] === expected, 'Expected ' + property + '=' + expected + ' but was ' + obj[property]);
}
function testHumanize() {
    console.log('Testing Humanize');
    var result = kinopoisk.humanize({trackerId:1, title:'Плавни / Миниатюрный остров / La Isla Minima / Marshland (Альберто Родригес / Alberto Rodriguez) [2014, Испания, детектив, HDRip] DVO (Колобок)'});
    assert(result, 'nameRU', 'Плавни');
    assert(result, 'nameEN', 'Marshland');
    assert(result, 'year', '2014');

    result = kinopoisk.humanize({trackerId:1, title:'Аукцион 1999/ Le demantelement / The Auction 1999 (Себастьен Пилот / Sebastien Pilote) [1962, Канада, Драма, DVDRip] Sub Rus + Original Fre [1.46 GB]]'});
    assert(result, 'nameRU', 'Аукцион 1999');
    assert(result, 'nameEN', 'The Auction 1999');
    assert(result, 'year', '1962');

    result = kinopoisk.humanize({trackerId:1, title:'[Обновлено] Эммануэль / Emmanuelle (Жюст Жэкин / Just Jaeckin) [1974, Франция, драма, мелодрама, эротика, HDRip] AVO (Леонид Володарский) + AVO (Павел Прямостанов) [1.42 GB]'});
    assert(result, 'nameRU', 'Эммануэль');
    assert(result, 'nameEN', 'Emmanuelle');
    assert(result, 'year', '1974');

    result = kinopoisk.humanize({trackerId:1, title:'[Обновлено] Не промахнись, Асунта! / La&#039; Ragazza con pistola (Марио Моничелли / Mario Monicelli) [1968, Италия, мелодрама, комедия, TeleSynch &gt; DVD] [Советская прокатная копия] Dub (Союзмультфильм) [3.88 GB]'});
    assert(result, 'nameRU', 'Не промахнись, Асунта!');
    assert(result, 'nameEN', 'Ragazza con pistola');
    assert(result, 'year', '1968');

    result = kinopoisk.humanize({trackerId:1, title:'Неугомонный Казимир / Невинный Казимир / L\'Innocente Casimiro (Карло Кампогаллиани / Carlo Campogalliani) [1945, Италия, Комедия, DVDRip] VO (Urasiko) [778.9 MB]'});
    assert(result, 'nameRU', 'Неугомонный Казимир');
    assert(result, 'nameEN', 'Innocente Casimiro');
    assert(result, 'year', '1945');

    result = kinopoisk.humanize({trackerId:3, title:'Притчи 4 / 2013 / РУ / DVD-5'});
    assert(result, 'nameRU', 'Притчи 4');
    assert(result, 'nameEN', '');
    assert(result, 'year', '2013');
    console.log('Done testing Humanize');
}
var testDb = async(function () {
    console.log('Testing Db');
    var result = await(db.films.search({ nameEN: 'eran trece', nameRU: '', year: '1930' }));
    assert(result, 'nameRu', '');
    assert(result, 'name', 'Eran trece');
    assert(result, 'year', 1931);

    result = await(db.films.search({ nameEN: '', nameRU: 'Шик', year: '2003' }));
    assert(result, 'nameRu', 'Шик');
    assert(result, 'name', '');
    assert(result, 'year', 2003);
    console.log('Done Testing Db');

});
var testSearch = async(function(){
    console.log('Testing Search');
    /*
    var result = await(kinopoisk.searchApi({ title: 'Паутина / The Cobweb (Винсенте Миннелли / Vincente Minnelli) [1955, США, драма, DVDRip] VO (fiendover) + Original Eng + Sub Rus (dhreilly) [2.19 GB]' }));
    assert(result, 'nameRu', 'Паутина');
    assert(result, 'name', 'The Cobweb');
    assert(result, 'year', 1955);
    assert(result, 'id', 10763); 
    */
    var result = await(kinopoisk.searchApi({ title: 'Нулевые парни / Живые мишени / The Zero Boys (Нико Масторакис / Nico Mastorakis) [1986, США, ужасы, триллер, слэшер, HDRip] VO (sanchez) [1.46 GB]' }));
    assert(result, 'nameRu', 'Нулевые ребята');
    assert(result, 'name', 'The Zero Boys');
    assert(result, 'year', 1986);
    assert(result, 'id', 36466); 

    result = await(kinopoisk.searchApi({ title: 'Секрет успеха / A Woman of Independent Means (Роберт Гриволд / Robert Greenwald) [1995, Великобритания, США, Драма, DVDRip] DVO + Original Eng [4.44 GB]'}));
    assert(result, 'nameRu', 'Секрет успеха');
    assert(result, 'name', 'A Woman of Independent Means');
    assert(result, 'year', 1995);
    assert(result, 'id', 94294); 
    
    result = await(kinopoisk.searchApi({ title: 'Цветы Календулы (Сергей Снежкин) [1998, Драма, DVB, AVC] [1.17 GB]'}));
    assert(result, 'nameRu', 'Цветы календулы');
    assert(result, 'name', '');
    assert(result, 'year', 1999);
    assert(result, 'id', 40773); 
    
    result = await(kinopoisk.searchApi({ title: '[Обновлено] Мои герои / Mes heros (Эрик Бенар / Eric Besnard) [2012, Франция, комедия, драма, DVB] DVO (НТВ+) + Original (Fre) + Sub (Rus, Eng, Fre, Deu) [2.02 GB]'}));
    assert(result, 'nameRu', 'Мои герои');
    assert(result, 'name', 'Mes heros');
    assert(result, 'year', 2012);
    assert(result, 'id', 647699); 

    result = await(kinopoisk.searchApi({ title: 'Завтра будет поздно (Мартин Тяпак, Александр Карпов) [1972, военный, DVDRip] DUB [1.45 GB]'}));
    assert(result, 'nameRu', 'Завтра будет поздно');
    assert(result, 'name', '');
    assert(result, 'year', 1972);
    assert(result, 'id', 424969); 

    console.log('Done Testing Search');
});
testHumanize();
testDb()
    .then(testSearch)
    .catch(function (err) { console.error(err); });

