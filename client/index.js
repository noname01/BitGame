/**
 * Created by Alchemist on 2014/10/17.
 */

var URL="/api/";

$(window).load(function(){
    var currentPid;
    var answer;
    var userName;

    getProblemList();
    $("#submit").click(function(){
        sendAnswer();
    });

    function getProblem(pid){
        currentPid = pid;
        $.ajax({
            url: URL + "prob/" + pid,
            type: "get",
            success: function(result){
                alert(result.description);
                $("#question").text(result.description);
            },
            dataType: "json"
        });
    }

    function getProblemList(){
        $.ajax({
            url: URL + "list",
            type: "get",
            success: function(result){
                $("#problems").empty();
                $.each(result, function(i, value) {
                    var correct = "";
                    if (typeof(value.rate) != "undefined")
                        correct = " correct";
                    $("#problems").append('<div class=\"problem' + correct + '\" id=\"problem_' + value.pid + '\">' + value.title + '</div>');
                });
                $(".problem").click(function(){
                    getProblem(this.id.substring(8));
                });
            },
            data: {
                id: userName
            },
            dataType: "json"
        });
    }

    function sendAnswer(){
        $.ajax({
            url: URL + "answer",
            type: "post",
            success: function(result){
                var correct = result.correct;
                var rate = result.rate;

                alert("Your answer is " + correct + ". Your score is " + rate);
            },
            data: {
                id: 1,
                pid: currentPid,
                answer: $("answer").innerText
            },
            dataType: "json"
        });
    }
});

