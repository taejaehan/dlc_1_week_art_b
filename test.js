
var MIN_DISTANCE = 0.005;
var DATA_PATH = './data/';

var imagesVec = [];
var selectedVecIdx = [];
var imagesData = [];

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
    // do something with your data
    console.log(data);
    getImages(data.images);


    $('#masonry_con').imagesLoaded( {
      // options...
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
        var vec = new Victor(images[i].x, images[i].y);
        imagesVec.push(vec);
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

    var first = imagesVec[selectedVecIdx[0]];
    var last = imagesVec[selectedVecIdx[1]];
    console.log('first :' + imagesData[selectedVecIdx[0]].name );
    console.log('last :' + imagesData[selectedVecIdx[1]].name );
    for(var i=0; i < imagesVec.length; i++){
        console.log('imagesData[i].name : ' + imagesData[i].name)
        if(selectedVecIdx[0] != i && selectedVecIdx[1] != i){
            var distance = getDistance(imagesVec[i], first, last);
            console.log(distance);
            if(distance < MIN_DISTANCE){
                $('#preview_list li.start').after('<li class="mid" ><img src="'+items.eq(i).attr('src')+'"></li>')
            }
        }
    }
    console.log('==============================================');
    $('#preview_list').removeClass('ongoing');
    $('#preview_list').addClass('ready');
    selectedVecIdx = [];
}

var dd = getDistance(new Victor(3,5), new Victor(0,0), new Victor(6,1))
console.log('dd : ' + dd);

function getDistance(p, a, b){
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
