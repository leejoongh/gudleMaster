//express 라이브러리 사용 정의
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engin', 'ejs');


var db;

MongoClient.connect('mongodb+srv://leeMaster:asdf2345@cluster0.wqbuz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{useUnifiedTopology:true}, function(에러, client){

    if(에러) {return console.log(에러)}
    db = client.db('todoApp');


    //8080포트로 서버 띄워주세요
    app.listen(8080, function(){
        console.log('listening on 8080')
    });

})

app.get('/', function(reQ, reS){
    reS.sendFile(__dirname + '/index.html')
});

app.get('/write', function(reQ, reS){
    reS.sendFile(__dirname + '/write.html')
});

app.post('/add', function(reQ, reS){ //누가 폼에 /add로 post 요청하면
     reS.send('전송완료');
        //DB.counter 내의 총게시물갯수를 찾음
     db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
         var 총게시물갯수 = 결과.totalpost; //총게시물갯수를 변수에 저장
            //이제 DB.post에 새게시물 기록함
         db.collection('post').insertOne( { _id : 총게시물갯수 + 1,  제목 : reQ.body.title, 날짜 : reQ.body.date }, function(에러, 결과){
            
            //$set, $inc 등 연사자 활용
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc :{totalpost : 1}},function(에러, 결과){
                if(에러){return console.log(에러);}
            }) //완료되면 DB.counter 내의 총개시물 갯수 + 1 
            console.log('저장완료');
        });
     });

});


//list 요청 처리
app.get('/list', function(reQ, reS){
    
    //데이터 다가오져오기 함수와 ejs안에 넣기 
    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        reS.render('list.ejs', { posts : 결과});
    });
    
});

app.delete('/delete', function(요청, 응답){
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);
    db.collection('post').deleteOne(요청.body, function(에러, 결과){
     console.log('삭제완료');
    응답.status(200).send({ message : '성공했습니다' });
    })
})
