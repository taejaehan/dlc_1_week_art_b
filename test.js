
var MIN_DISTANCE = 0.05;


var MAX_SHOW_MID = 7;
var selectedVecIdx = [];
var imagesData = [];
var midImgs = []

//$('#loading').hide();
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}

fetchJSONFile(DATA_PATH+'json/data.json', function(data){
    console.log(data);
    getImages(data.images);

    $('#masonry_con').imagesLoaded( {
      },
      function() {
        makeMasonry();
      }
    );

});

function getImages(images) {
    imagesData = images;
    var html = "";
    for (var i = 0; i < images.length; i++) {
        html += '<div class="grid-item"><img src="'+DATA_PATH+'crop/' + images[i].name + '" index="'+i+'"><p>'+images[i].name+'</p></div>';
    }
    var str = $(html);
    $('.grid').append(str);
}

function makeMasonry(){
    var elem = document.querySelector('.grid');
    var msnry = $('#masonry_con').masonry({
      // options
      itemSelector: '.grid-item',
      columnWidth: 100
    });

    $('.grid-item').on('click', function () {
        if($('#preview_list').hasClass('ready')){
            $('#preview_list ul').empty();
            $('#preview_list').addClass('action');
            $('#preview_list').removeClass('ready');
        }
        if($('#preview_list').hasClass('action')){
            if($('#preview_list').find('li.start').length === 0){
                $('#preview_list ul').append('<li class="start" ><img src="'+$(this).children('img').attr('src')+'"></li>');
                selectedVecIdx.push(parseInt($(this).children('img').attr('index')));
            }else{
                $('#loading').show();

                $('#preview_list ul').append('<li class="end" ><img src="'+$(this).children('img').attr('src')+'"></li>');
                $('#preview_list').removeClass('ready');
                $('#preview_list').addClass('ongoing');
                selectedVecIdx.push(parseInt($(this).children('img').attr('index')));
                $('#preview_list').removeClass('action');
                calulateSimilarity();
            }
        }
    })

}

function calulateSimilarity(){

    var items = $('.grid-item img');

    var first = new Victor(imagesData[selectedVecIdx[0]].x, imagesData[selectedVecIdx[0]].y);
    var last =  new Victor(imagesData[selectedVecIdx[1]].x, imagesData[selectedVecIdx[1]].y);
    console.log('first :' + imagesData[selectedVecIdx[0]].name );
    console.log('last :' + imagesData[selectedVecIdx[1]].name );

    for(var i=0; i < imagesData.length; i++){
        console.log('imagesData[i].name : ' + imagesData[i].name)
        if(selectedVecIdx[0] != i && selectedVecIdx[1] != i){
            var distance = getDistance(new Victor(imagesData[i].x, imagesData[i].y), first, last);
            console.log(distance);
            if(distance < MIN_DISTANCE){
                midImgs.push({
                    name : imagesData[i].name,
                    src : items.eq(i).attr('src'),
                    a_to_p : first.distance(new Victor(imagesData[i].x, imagesData[i].y))
                })

            }
        }
    }
    midImgs.sort(function(first, second) {
        return first.a_to_p -  second.a_to_p;
    });
    var midLength = midImgs.length;
    var cut = parseInt(midLength / MAX_SHOW_MID) + 1;

    console.log('cut :  ' + cut);
    for(var i=0; i < midLength; i=i+cut){
        console.log(i);
        $('#preview_list li.start').after('<li class="mid" ><img src="'+midImgs[i]['src']+'"></li>')
    }
    console.log(midImgs);
    console.log('==============================================');
    $('#preview_list').removeClass('ongoing');
    $('#preview_list').addClass('ready');
    selectedVecIdx = [];
    midImgs = [];
    $('#loading').hide();
}

var dd = getDistance(new Victor(3,5), new Victor(0,0), new Victor(6,1))
console.log('dd : ' + dd);

function getDistanceAtoP(a, p){

}
function getDistance(p, a, b){
    var isOuterP = isOuterPoint(p.clone(), a.clone(), b.clone());
//    isOuterP = false;
    if(isOuterP){
        return 1;
    }
    var normalPoint = getNormalPoint(p.clone(), a.clone(), b.clone());
//    console.log(normalPoint);
    var distance = normalPoint.distance(p);
    return distance;
}
function getNormalPoint(p, a, b){
    var ap = p.subtract(a);
    var ab = b.subtract(a);

    ab.normalize();
    var scalar = new Victor (ap.dot(ab), ap.dot(ab));
    ab.multiply(scalar)

    normalPoint = a.add(ab);

    return normalPoint;
}


function isOuterPoint(p, a, b){

    console.log('p : ' + p);
    console.log('a : ' + a);
    console.log('b : ' + b);
    var ab = b.clone().subtract(a.clone());
    console.log('ab : ' + ab);

    ab.normalize();
    console.log('ab : ' + ab);

    var radius = Math.abs(b.distance(a) / 2);
    var radiusScalar = new Victor (radius, radius);

    console.log('radius : ' + radius);
    console.log('radiusScalar : ' + radiusScalar);

    ab.multiply(radiusScalar);
    ab.add(a)

    var pointToCenter = Math.abs(ab.distance(p));
    var aToCenter = Math.abs(ab.distance(a));
    console.log('a : ' + a);
    console.log('b : ' + b);
    console.log('pointToCenter : ' + pointToCenter);
    console.log('aToCenter : ' + aToCenter);
    if(pointToCenter >= aToCenter){
        return true;
    }
    else{
        return false;
    }
}

//var cc = isOuterPoint(new Victor(0,0).clone(), new Victor(3,0).clone(), new Victor(0,4).clone());
//console.log('cc : ' + cc);