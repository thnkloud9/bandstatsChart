/**
 *
 * bandstats chart
 *
 * author: Mark Lewis
 */

var bandstatsChart = {
   
    deliDomain: 'http://www.thedelimagazine.com/bandstats/api',

    genres: [],
    regions: [], 
    bandNames: [],
    chartType: '',
    allRegions: [],
    allGenres: [],
    limit: 20,
 
    defaultRegion: 'NYC',
    defaultChartType: 'bandScore',
    defaultLimit: 20,

    facebookId: '',
    cache: {},
    debug: true,
    initialized: false,

    init: function(callback) {
        bandstatsChart.setRegion(bandstatsChart.defaultRegion); 
        bandstatsChart.showSelectedRegion();
        bandstatsChart.setChartType(bandstatsChart.defaultChartType);
        bandstatsChart.initialized = true;
        callback();
    },

    setChartType: function(chartType) {
        bandstatsChart.chartType = chartType;
    },

    setLimit: function(limit) {
        bandstatsChart.defaultLimit = limit;
    },

    setRegion: function(region) {
        bandstatsChart.regions = [region];
    },

    setFacebookId: function(id) {
        bandstatsChart.facebookId = id;
    },

    addRegion: function(region) {
        bandstatsChart.regions.push(region);
    },

    getAllRegions: function(callback) {
        var url = bandstatsChart.deliDomain + '/regions.php';

        bandstatsChart._send(url, [], 'jsonp', function(results) {
            bandstatsChart.addRegionsOptions(results);
            if (callback) {
                callback(results);
            }
        });
    },

    addRegionsOptions: function(results) {
        $('#bsc-scene-select').empty();
        for (var r in results) {
            var region = results[r];
            $('#bsc-scene-select').append("<option value='" + region.regionName + "'>" + region.regionName + '</option>');
        }
        bandstatsChart.showSelectedRegion();
    },

    showSelectedRegion: function() {
        var region = bandstatsChart.regions;
        $('#bsc-scene-select').val(region);
    },

    addGenre: function(genre) {
        var index = bandstatsChart.genres.indexOf(genre);
        if (index < 0) {
            bandstatsChart.genres.push(genre);
            bandstatsChart.showSelectedGenres();
            bandstatsChart.getChart();
        }
    },

    removeGenre: function(genre) {
        var index = bandstatsChart.genres.indexOf(genre);
        bandstatsChart.genres.splice(index, 1);
        bandstatsChart.showSelectedGenres();
        bandstatsChart.getChart();
    },

    showSelectedGenres: function() {
        $('#bsc-genre-list').empty();
        for (var g in bandstatsChart.genres) {
            var genre = bandstatsChart.genres[g];
            var output = "<li><a href='#'>" + genre + "</a></li>";
            $('#bsc-genre-list').append(output);
            $("input:checkbox[value='" + genre + "']").attr("checked", true);
        }
    },

    getAllGenres: function(callback) {
        var url = bandstatsChart.deliDomain + '/genres.php';

        bandstatsChart._send(url, [], 'jsonp', function(results) {
            bandstatsChart.addGenresOptions(results);
            if (callback) {
                callback(results);
            }
        });
    },

    addGenresOptions: function(results) {
        $('#bsc-genre-select').empty();
        for (var g in results) {
            var genre = results[g];
            var output = "<li>";
            
            output += "<input class='bsc-genre-link' type='checkbox' name='" + genre.genreName + "' value='" + genre.genreName + "' />";
            output += genre.genreName + "</li>";
            $('#bsc-genre-select').append(output);
        }
    }, 

    getChart: function(params, callback) {
        var url = bandstatsChart.deliDomain + '/chart.php';

        if (!params) {
            var params = [];
        }

        if (!params['region']) {
            params['region'] = bandstatsChart.regions.join(',');
        }

        if (!params['genre']) {
            params['genre'] = bandstatsChart.genres.join(',');
        }
        
        if (!params['limit']) {
            params['limit'] = bandstatsChart.limit;
        }

        if (!params['orderBy']) {
            params['orderBy'] = bandstatsChart.chartType;
        }

        bandstatsChart._send(url, params, 'jsonp', function(results) {
            bandstatsChart.addChart(results);
            if (callback) {
                callback(results);
            }
        });
    },

    addChart: function(results) {
        var score = 1;
        var half = (results.length / 2);

        $('#bsc-chart').empty();
        for (var r in results) {
            var result = results[r];
            var output = '';
           
            if (score <= half) { 
                output += "<li><h3><span>" + score + "</span>";
            } else {
                output += "<li class='alt'><h3><span>" + score + "</span>";
            }
            output += result.bandName + "</h3>";
            output += "<ul><li class='star4' data-band-id='" + result.bandId + "'>Star</li>";
            output += "<li class='facebook'>Band Facebook Page</li>";
            output += "<li class='listen' data-band-name='" + result.bandName + "'>Listen</li></ul></li>";
            
            $('#bsc-chart').append(output);
            score++;
        }
    },

    showLoading: function() {
        
    },

    hideLoading: function() {

    },

    log: function(msg) {
        if (bandstatsChart.debug) {
            console.log(msg);
        }
    },
    
    _send: function(url, params, dataType, callback) {
        var first = true;

        // show loading page
        bandstatsChart.showLoading();

        for (param in params) {
            url += (first) ? '?' : '&';
            first=false;
            url += param + "=" + params[param]
        }

        bandstatsChart.log(url);

        if (this.cache[url]) {
            bandstatsChart.log(url + ' loaded from cache');
            bandstatsChart.hideLoading();
            callback(this.cache[url]);
        } else {
            $.ajax({
                url: url,
                type: 'get',
                dataType: dataType,
                success: function(response) {
                    bandstatsChart.cache[url] = response
                    bandstatsChart.hideLoading();
                    callback(response);
                },
                error: function(errorObj, textStatus, errorMsg) {
                    console.log(url + ' -- ' + JSON.stringify(errorMsg));
                    callback();
                }
            });
        }
    } 
 
};

$(function(){
    /* event handlers */
    $('#bsc-scene-select').change(function() {
        bandstatsChart.setRegion($(this).val());
        bandstatsChart.getChart();
    });

    $('#bsc-orderby-select').change(function() {
        bandstatsChart.setChartType($(this).val());
        bandstatsChart.getChart();
    });

    $('.bsc-genre-link').live('click', function() {
        if (bandstatsChart.genres.indexOf($(this).val()) >= 0) {
            bandstatsChart.removeGenre($(this).val());
        } else {
            bandstatsChart.addGenre($(this).val());
            var genreList = [];
            $('.bsc-genre-link:checked').each(function() {
                genreList.push($(this).val());
            });
            var genreListString = genreList.join(",");
            // save the list to the server
            var url = '../api/save_prefs.php?name=genre-list&value=' + genreListString; 
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',      
                success: function(response) {
                    console.log(response);
                },
                error: function(errorObj, textStatus, errorMsg) {
                    console.log(url + ' -- ' + JSON.stringify(errorMsg));
                }
            });
                
        }
    });

    $('.listen').live('click', function() {
        var url = "http://www.thedelimagazine.com/media_player/media_player.html?band_name=" + $(this).attr('data-band-name');
        window.open(url, 'deliPlayer', 'width=270,height=800,menubar=0,location=0,titlebar=0,toolbar=0,status=0,directories=0, ');
    });

    $('.star4').live('click', function() {
        var bandId = $(this).attr('data-band-id');
        var url = '../api/save_rating.php?bandId=' + bandId + '&rating=1';
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function(response) {
                console.log(response);
            },
            error: function(errorObj, textStatus, errorMsg) {
                console.log(url + ' -- ' + JSON.stringify(errorMsg));
            }
        });
    });
});
