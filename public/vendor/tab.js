const defaultOpentab = "time_based_schedules";
const LAMPS_NO = 2 // sensor_value lamp and device state lamp
const DS = document.getElementById('ds')
const SV = document.getElementById('sv')


start(); // go back to the current tab and set lamps with current values

function start() {
    let tabName = localStorage.getItem('tab');
    if (tabName) {
        document.getElementById('btn_' + tabName).click();
    } else {
        document.getElementById('btn_' + defaultOpentab).click();
    }

    onoff('s_lamp0', 'sv',  SV.value); // set ON for both the lamps as default for new schedule
    onoff('s_lamp1', 'ds', DS.value);
}


function onoff(lamp_id, type, value) {
    if (value !== '1') { // switch state
        blabel = (type == 'sv')? "ON DECTECTION" : "TURN ON";
        bstyle = "green";
        bcolor = "lightgreen";
    }
    else {
        blabel = (type == 'sv')? "NO DECTECTION" : "TURN OFF";
        bstyle = "lightgray";
        bcolor = "gray";
    }

    let lamp = document.getElementById(lamp_id)
    lamp.style.background = bstyle
    lamp.style.color = bcolor
    lamp.innerHTML = blabel
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