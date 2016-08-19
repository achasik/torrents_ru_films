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
    console.log('Done testing Humanize');
}

testHumanize();
