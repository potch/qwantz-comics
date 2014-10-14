var request = require('request');
var cheerio = require('cheerio');

var dict = {};
var comic = '1';

var url = 'http://www.qwantz.com/index.php?comic=';

function err(s) {
  process.stderr.write(s + '\n');
}

function crawl() {
  err(url + comic);
  request(url + comic, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      var img = $('img.comic');
      var src = img.attr('src');
      var _ = src.match(/^http:\/\/www\.qwantz\.com\/comics\/comic2-(.+)\.png$/);
      if (_) {
        var imgNum = _[1];
        dict[comic] = imgNum;
      } else {
        err('no url match: ' + src);
      }

      var nextArrow = $('a[rel="next"]');
      if (nextArrow.length) {
        var href = nextArrow.attr('href');
        _ = href.match(/^http:\/\/www\.qwantz\.com\/index\.php\?comic=(.+)$/);
        if (_) {
          comic = _[1];
          setTimeout(crawl, 10);
          return;
        } else {
          err('no next match: ' + href);
        }
      } else {
        err('no arrow');
      }
      
    } else {
      err(error + ' ' + response.statusCode);
    }
    process.stdout.write(JSON.stringify(dict, null, 2));
  });
}

crawl();
