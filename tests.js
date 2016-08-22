var kinopoisk = require('./kinopoisk');

function assert(obj,property,expected){
    console.assert(obj[property]===expected,'Expected '+ property+'='+expected+' but was '+ obj[property]);
}
function testHumanize(){
    console.log('Testing Humanize');
    var result = kinopoisk.humanize('Плавни / Миниатюрный остров / La Isla Minima / Marshland (Альберто Родригес / Alberto Rodriguez) [2014, Испания, детектив, HDRip] DVO (Колобок)');
    assert(result,'nameRU','Плавни');
    assert(result,'nameEN','Marshland');
    assert(result,'year','2014');
    
    result = kinopoisk.humanize('Аукцион 1999/ Le demantelement / The Auction 1999 (Себастьен Пилот / Sebastien Pilote) [1962, Канада, Драма, DVDRip] Sub Rus + Original Fre [1.46 GB]]');
    assert(result,'nameRU','Аукцион 1999');
    assert(result,'nameEN','The Auction 1999');
    assert(result,'year','1962');
    
    result = kinopoisk.humanize('[Обновлено] Эммануэль / Emmanuelle (Жюст Жэкин / Just Jaeckin) [1974, Франция, драма, мелодрама, эротика, HDRip] AVO (Леонид Володарский) + AVO (Павел Прямостанов) [1.42 GB]');
    assert(result,'nameRU','Эммануэль');
    assert(result,'nameEN','Emmanuelle');
    assert(result,'year','1974');

    result = kinopoisk.humanize('[Обновлено] Не промахнись, Асунта! / La&#039; Ragazza con pistola (Марио Моничелли / Mario Monicelli) [1968, Италия, мелодрама, комедия, TeleSynch &gt; DVD] [Советская прокатная копия] Dub (Союзмультфильм) [3.88 GB]');
    assert(result,'nameRU','Не промахнись, Асунта!');
    assert(result,'nameEN','Ragazza con pistola');
    assert(result,'year','1968');
    
    result = kinopoisk.humanize('Неугомонный Казимир / Невинный Казимир / L\'Innocente Casimiro (Карло Кампогаллиани / Carlo Campogalliani) [1945, Италия, Комедия, DVDRip] VO (Urasiko) [778.9 MB]');
    assert(result,'nameRU','Неугомонный Казимир');
    assert(result,'nameEN','Innocente Casimiro');
    assert(result,'year','1945');
    
    console.log('Done testing Humanize');
}

testHumanize();
