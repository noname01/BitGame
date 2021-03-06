/**
 * Created by Alchemist on 2014/10/17.
 */

var URL="/api/";

$(window).load(function(){
    var currentPid;
    var answer;
    var userName;
    var totProb = 8;

    getProblemList(1);

    function showLoading(){
        $("#submit").prop('disabled', true);
        $("#show-levels").prop('disabled', true);
        $("#spinner").css("opacity", 1);
    }

    function finishLoading(){
        $("#submit").prop('disabled', false);
        $("#show-levels").prop('disabled', false);
        $("#spinner").css("opacity", 0);
    }

    $("#submit").click(function(){
        showLoading();
        sendAnswer();
    });

    function getProblem(pid){
        currentPid = pid;
        $.ajax({
            url: URL + "prob/" + pid,
            type: "get",
            success: function(result){
                $("#question").text(result.description);
                $("#level-title").text(result.title);
                $("#operators").empty();
                $.each(result.operators, function(key, value) {
                    $("#operators").append('<button type="Button" class="operator-btn inline-button btn btn-default">' + key +'</button>')
                });
                $("#content").fadeIn();
                $(".operator-btn").click(function(){
                    $("#answer").val( $("#answer").val() + $(this).text());
                });

                $("#stars").removeClass("stars-0 stars-1 stars-2 stars-3").addClass("stars-0");

                if (typeof(result.correct) != "undefined") {
                    if (result.correct) {
                        $("#result").html("You have solved this problem.<br/> The minimum number of operators you used is " + result.ops + " on " + result.date);
                    } else {
                        $("#result").html("You failed on this problem<br/>");
                    }

                    var stars = (result.ops <= result.level[0]) ? 3 : (result.ops <= result.level[1] ? 2 : 1);
                    console.log(stars);
                    if (!result.correct)
                        stars = 0;

                    $("#stars").removeClass("stars-0").addClass("stars-" + stars);

                    $("#answer").val(result.answer);
                } else
                    $("#result").html("You never try this problem");
            },
            dataType: "json"
        });
    }

    function getProblemList(isfresh){
        $.ajax({
            url: URL + "list",
            type: "get",
            success: function(result){
                var totalStars = 0;
                $("#problems").empty();
                $.each(result, function(i, value) {
                    var stars = 0;
                    var correct = "";
                    if (typeof(value.correct) != "undefined" && value.correct) {
                        correct = " correct";
                        stars = (value.ops <= value.level[0]) ? 3 : (value.ops <= value.level[1] ? 2 : 1);
                    }
                    else stars = 0;
                    totalStars = totalStars + stars;
                    $("#problems").append('<div class=\"problem' + correct + '\" id=\"problem_' + value.pid + '\">' + value.title + '</div>');
                });
                $("#total-stars").html("Total <i class='fa fa-star' id='tot-star'></i>: " + totalStars);
                $(".problem").click(function(){
                    $('#myModal').modal('hide');
                    $("#answer").val("");
                    getProblem(this.id.substring(8));
                });
                if (isfresh == 1)
                    getProblem($(".problem").first().attr("id").substring(8));
            },
            data: {
                id: userName
            },
            dataType: "json"
        });
    }

    function sendAnswer(){
        //alert($("#answer").val());
        $.ajax({
            url: URL + "answer",
            type: "post",
            success: function(result){
                finishLoading();
                if(result.error){
                    swal("Ooops!", result.error, "error");
                    //alert(result.error);
                    return;
                }
                var correct = result.correct;
                if (correct){
                    if(parseInt(currentPid) == totProb - 1)
                        swal("WOW!", "You solved the last problem!", "success");
                     else swal({
                        title: "Good job!",
                        text: "Can you do better?",
                        type: "success",
                        showCancelButton: true,
                        confirmButtonColor: "#5cb85c",
                        confirmButtonText: "Next Level",
                        cancelButtonText: "Try Again",
                        closeOnConfirm: true
                    }, function(){
                        $("#answer").val("");
                        getProblem(parseInt(currentPid) + 1);
                    });
                }
                else
                    swal("Ooops!", "Your answer is incorrect.", "error");
                getProblemList(0);
                getProblem(currentPid);
            },
            data: {
                id: 1,
                pid: currentPid,
                answer: $("#answer").val()
            },
            dataType: "json"
        });
    }
});

