const CHANGES_LIST = 'changes'
// localStorage.removeItem(CHANGES_LIST)

start();

function start() {

    const defaultOpentab = "time_based_schedules";
    let tabName = localStorage.getItem('tab');
    if (tabName) {
        document.getElementById('btn_' + tabName).click();
    } else {
        document.getElementById('btn_' + defaultOpentab).click();
    }

    let changesStr = localStorage.getItem(CHANGES_LIST)
    if (changesStr) {
        let changes = JSON.parse(changesStr)
        console.log(changes.length)

        changes.forEach(ch => {
            console.log(ch.value)
            let lamp = document.getElementById(ch.lampId)
            let val = ch.value
            lamp.setAttribute('value', val)
            lamp.style.background = ch.style
            lamp.style.color = ch.color
            lamp.innerHTML = ch.label
        })
        console.log('------------------------')
        
    }

    // restore changes on the schedule
    // const lamp = document.getElementById(localStorage.getItem('lampId'))
    // const val = localStorage.getItem('val')
    // lamp.setAttribute('value', val)
    // lamp.style.background = localStorage.getItem('style');
    // lamp.style.color = localStorage.getItem('color');
    // lamp.innerHTML = localStorage.getItem('label');
}


const url = '/sche';
function onoff(element, elId, lamp_id) {
    let pressedEl = document.getElementById(elId)
    let lampEl = document.getElementById(lamp_id)

    let value = !pressedEl.value;
    pressedEl.setAttribute('value', value)

    var blabel, bstyle, bcolor;
    if (value) {
        blabel = "on";
        bstyle = "green";
        bcolor = "lightgreen";
    }
    else {
        blabel = "off";
        bstyle = "lightgray";
        bcolor = "gray";
    }
    console.log('new value = ', value)
    //   var child=element.firstChild;
    lampEl.style.background = bstyle;
    lampEl.style.color = bcolor;
    lampEl.innerHTML = blabel;

    // save toggled values
    let changesStr = localStorage.getItem(CHANGES_LIST)
    let change = {
        "lampId": lamp_id,
        "value": value,
        "label": blabel,
        "style": bstyle,
        "color": bcolor
    }
    let changes = [], changeFound = false;
    if (changesStr) {
        changes = JSON.parse(changesStr) // if found, convert into json

        let currentChange = changes.filter(ch => ch.lampId == lamp_id)
        if (currentChange) {
            console.log('current', currentChange)
            changeFound = true
        }
    }
    if(changeFound == false){
        changes.push(change)
    }
    console.log(changes.length, changes[lamp_id])
    localStorage.setItem(CHANGES_LIST, JSON.stringify(changes)) // push changesArr as str


    // localStorage.setItem('lampId', lamp_id)
    // localStorage.setItem('label', blabel)
    // localStorage.setItem('style', bstyle)
    // localStorage.setItem('color', bcolor)
}


function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    localStorage.setItem('tab', tabName);
    evt.currentTarget.className += " active";
}

/*

    $(document).on("click", "#deleteSchedule", function () {
        var tip = "Are you sure you want to delete the current schedule data?";
        if (confirm(tip)) {
            var href = $(this).attr("href");
            window.location.href = href
        }
        //阻止超链接的默认行为
        return false;
    });
    //全选/全不选
    $("#check_all").click(function () {
        $(".check_item").prop("checked", $(this).prop("checked"));
    });
    $(document).on("click", ".check_item", function () {
        //判断当前选中的元素个数是否为所有复选框个数
        var flag = $(".check_item:checked").length == $(".check_item").length;
        $("#check_all").prop("checked", flag);
    });
    $("#deleteSelected").click(function () {
        if ($(".check_item:checked").length > 0) {
            var devicesNames = "";
            var del_ids = "";
            $.each($(".check_item:checked"), function () {
                devicesNames += $(this).parents("tr").find("td:eq(2)").text() + ",";
                del_ids += $(this).parents("tr").find("td:eq(1)").text() + ",";
            });
            //去除末尾多余的逗号
            devicesNames = devicesNames.substring(0, devicesNames.length - 1);
            del_ids = del_ids.substring(0, del_ids.length - 1);
            var tip = "Are you sure you want to delete [" + devicesNames + "] devices data?";
            if (confirm(tip)) {
                var href = "/" + del_ids;
                $("#delete_form").attr("action", href).submit();
            }
        } else {
            alert("Please select the data you want to delete!")
        }
        //阻止超链接的默认行为
        return false;
    });
*/