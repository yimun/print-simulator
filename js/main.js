var workQueue = []; // 作业队列
var printQueue = []; // 打印队列
var completeQueue = []; // 完成队列

var printSpeed = 800; // 打印速度，默认每份1000ms
var printQueueMax = 3; // 最大打印任务数
var intervalProcess = null;
var currentWork = null;
var wait = false;

$().ready(function() {
    updateInk(1, 1, 1, 1);
});

function isSupportFileApi() {
    if (window.File && window.FileList && window.FileReader && window.Blob) {
        return true;
    }
    return false;
}

function selectFile() {

    if (!isSupportFileApi()) {
        alert("你的浏览器不支持读取文件");
        return;
    }
    var file = document.getElementById("file").files[0];
    if (!file) {
        alert("请先选择文件");
        return;
    }
    console.log("filename=" + file.name);
    var reader = new FileReader();
    reader.onload = (function(f) {
        return function(e) {
            parseJson(this.result);
        };
    })(file);
    reader.readAsText(file);
    // $("#action_select").hide();
    // $("#control").show();

}

function parseJson(str) {
    console.log(str);
    var obj = eval("(" + str + ")");
    $('#system-status').text(obj.device.system_status);
    $('#maint-state').text(obj.device.maint_state);
    $('#maint-error').text(obj.device.maint_error);
    $('#maint-active').text(obj.device.maint_active);

    updateInk(obj.device.ink_box.C, obj.device.ink_box.M, obj.device.ink_box.Y, obj.device.ink_box.K);

    for (var i = 0; i < obj.works_list.length; i++) {
        var work = obj.works_list[i];
        if(!work.device){
            work.device = obj.device;
        }
        work.remain = work.copies;
        workQueue.push(work);
    }
    workQueue.sort(function(a,b){
        return a.copies-b.copies;
    });
    updateWorkQueue();
    if(wait){
        startWork();
        wait = false;
    }
}

function buildTable(list) {
    var str = "";
    for (var i = 0; i < list.length; i++) {
        var work = list[i];
        str += "<tr onclick=\"preview('" + work.name + "'," + work.copies +");\"><td>" 
        + work.name + "</td><td>" + work.size_x + " X " + work.size_y + "</td><td>" 
        + work.device.x + " X " + work.device.y + "</td><td>" + work.copies + "</td></tr>";
    }
    return str;
}

function updateWorkQueue() {
    var tbody = $("#works-list").find("tbody").eq(0);
    tbody.empty();
    tbody.append(buildTable(workQueue));
    $("#work-count").text(workQueue.length);
}

function updatePrintQueue() {
    var tbody = $("#print-list").find("tbody").eq(0);
    tbody.empty();
    tbody.append(buildTable(printQueue));
    $("#print-count").text(printQueue.length);
    $("#job-queue").text(printQueue.length);

}

function updateCompleteQueue() {
    var tbody = $("#complete-list").find("tbody").eq(0);
    tbody.empty();
    tbody.append(buildTable(completeQueue));
    $("#complete-count").text(completeQueue.length);
}

function updateCurrentWork() {
    curIndex = currentWork.copies - currentWork.remain;
    if(currentWork.error_page && currentWork.error_page.index == curIndex) {
        console.log('error');
        pauseWork();
        $('#error-name').text(currentWork.name);
        $('#error-index').text(currentWork.error_page.index);
        $('#errorModal img').attr('src', currentWork.error_page.img);
        $('#errorModal').modal();
    }
    $("#current-work-name").text(currentWork.name);
    $("#current-work-copies").text(currentWork.copies);
    $("#current-work-complete").text(currentWork.copies - currentWork.remain);
    $("#current-speed").text(1000/printSpeed + " 份/秒");
}

function fullPrintQueue() {
    while(workQueue.length > 0 && printQueue.length < printQueueMax){
        printQueue.push(workQueue[0]);
        workQueue.splice(0, 1);
    }
    updatePrintQueue();
    updateWorkQueue();
}

function printPage() {
    if(currentWork == null || currentWork.remain == 0) {
        if(currentWork && currentWork.remain == 0) {
            // move to completeQueue
            completeQueue.push(currentWork);
            updateCompleteQueue();
        }
        if(printQueue.length > 0){
            currentWork = printQueue[0];
            currentWork.remain--;
            printQueue.splice(0, 1);
            fullPrintQueue();
        }else{
            fullPrintQueue();
            if(printQueue.length == 0){ 
                pauseWork();
                return;
            } else {
                currentWork = printQueue[0];
                currentWork.remain--;
                printQueue.splice(0, 1);
                fullPrintQueue();
            }
        }
    } else {
        currentWork.remain--;
    }
    $('#in-job').text('Yes');
    $('#page-count').text(currentWork.copies);
    updateCurrentWork();
}

function pauseWork() {
    $('#action_begin').text("继续").attr('onclick', 'startWork()');
    if(intervalProcess){
        clearInterval(intervalProcess);
        intervalProcess = null;
    }
    wait = true;
}

function startWork() {
    $('#action_begin').text("暂停").attr('onclick', 'pauseWork()');
    if(intervalProcess) {
        clearInterval(intervalProcess);
    }
    intervalProcess = setInterval('printPage()', printSpeed);
}

function stopWork() {
    $('#action_begin').text("开始").attr('onclick', 'startWork()');
    if(intervalProcess){
        clearInterval(intervalProcess);
        intervalProcess = null;
    }
    $("#current-work-name").empty();
    $("#current-work-copies").empty();
    $("#current-work-complete").empty();
    $("#current-speed").empty();
    $('#in-job').text('No');
    $('#page-count').text(0);

}

function preview(name, size) {
    $('#msg-name').text(name);
    $('#msg-time').text(size * printSpeed / 1000 + " s");
}

function updateInk(C, M, Y, K) {
    $('#C').css('width', C*100 + '%');
    $('#C').text(C*100 + "%");

    $('#M').css('width', M*100 + '%');
    $('#M').text(M*100 + "%");

    $('#Y').css('width', Y*100 + '%');
    $('#Y').text(Y*100 + "%");

    $('#K').css('width', K*100 + '%');
    $('#K').text(K*100 + "%");

}


