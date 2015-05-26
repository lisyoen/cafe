// initialize data

var itemlist = [ // start hyphen(-) it used as a category.
    "-COFFEE",
    "아메리카노 (Hot)",
    "아메리카노 (Ice)",
    "카페라테 (Hot)",
    "카페라테 (Ice)",
    "바닐라라떼 (Hot)",
    "바닐라라떼 (Ice)",
    "카푸치노 (Hot)",
    "카푸치노 (Ice)",
    "카페모카 (Hot)",
    "카페모카 (Ice)",
    "카라멜마끼아또 (Hot)",
    "카라멜마끼아또 (Ice)",
    "화이트모카 (Hot)",
    "화이트모카 (Ice)",
    "녹차라떼 (Hot)",
    "녹차라떼 (Ice)",
    "고구마라떼 (Hot)",
    "고구마라떼 (Ice)",
    "핫초코 (Hot)",
    "아이스초코 (Ice)",
    "화이트초코라떼 (Hot)",
    "화이트초코라떼 (Ice)",
    "오곡라떼 (Hot)",
    "오곡라떼 (Ice)",
    "화이트초코 (Hot)",
    "화이트초코 (Ice)",
    "우유 (Hot)",
    "우유 (Ice)",
    "-TEA",
    "얼그레이 (Hot)",
    "얼그레이 (Ice)",
    "페퍼민트 (Hot)",
    "페퍼민트 (Ice)",
    "패션후르츠 (Hot)",
    "패션후르츠 (Ice)",
    "유자차 (Hot)",
    "유자차 (Ice)",
    "대추차 (Hot)",
    "대추차 (Ice)",
    "-SMOOTHIE",
    "딸기스무디",
    "블루베리스무디",
    "키위스무디",
    "플레인요거트스무디",
    "복숭아 아이스티",
    "레몬 아이스티",
    "유자 에이드",
];

// model
function SaleItem(name) {
    this.name = name;
    this.count = 0;
}

function OrderBoard() {
    this.menu = {};
    this.menuCount = 0;
    this.orders = {};
    this.ordersCount = 0;

    var handlers = {};
    this.on = function(name, handler) {
        handlers[name] = handler;
    }

    this.emit = function(name, param) {
        var h = handlers[name];
        if (typeof(h) === "function") {
            h(param);
        }
    }

    this.setItems = function(itemlist) {
        for (var i in itemlist) {
            var itemName = itemlist[i];
            this.menu[itemName] = new SaleItem(itemName);
        }
    };

    // This function returns items reference, but you should not use to modify.
    this.getItem = function(name) {
        return this.menu[name];
    }

    this.orderItem = function(name) {
        var item = this.menu[name];
        item.count++;
        this.menuCount++;
        order.count++;
        this.ordersCount++;
    }

    this.cancelItem = function(name) {
        var item = this.menu[name];
        if (item) {
            item.count--;
            this.menuCount--;
        }
        var order = this.orders[name];
        if (order) {
            order.count--;
            this.ordersCount--;
        }
    }
}

var ob = new OrderBoard();
ob.setItems(itemlist);

$(document).on("pageinit", "#page1", function(e, u) {
    var list = $("#listMenu");

    function getOrderHandler(name, tag) {
        return function(e) {
            item = ob.menu[name];
            console.log(item);

            item.count++;
            tag.count.css({visibility: "visible"}).text(item.count);

            console.log(item.name);
        }
    }

    function getCancelHandler(name, tag) {
        return function(e) {
            item = ob.menu[name];
            console.log(item);

            if (item.count > 0) {
                item.count--;
                if (item.count > 0) {
                    tag.count.text(item.count);
                } else {
                    tag.count.css({visibility: "hidden"}).text(item.count);
                }
            }

            console.log(item.name);
        }
    }

    for (var i in ob.menu) {
        var item = ob.menu[i];
        var tag ={text:null, count:null};
        if (item.name.slice(0, 1) === "-") {
            list.append($("<li>", {"data-role": "list-divider"}).text(item.name.slice(1)));
        } else {
            list.append($("<li>", {"data-theme": "a"})
                        .append(orderButton = $("<a>", {href: "#"})
                                .append(tag.text = $("<h2>").text(item.name))
                                .append(tag.count = $("<span>", {class: "ui-li-count"}).css({visibility: "hidden"}).text(item.count)))
                        .append(cancelButton = $("<a>").text(item.name)));
            cancelButton.on("tap", getCancelHandler(item.name, tag));
            orderButton.on("tap", getOrderHandler(item.name, tag));
        }
    }

    list.listview("refresh");
    console.log("pageinit page1");
});

$(document).on("pageinit", "#page2", function(e, u) {
    console.log("pageinit page2");
});

$(function() {
    console.log("document ready");
    $("#page1").on("pageshow", function(e, u) {
        console.log("pageshow page1");
    });

    $("#page2").on("pageshow", function(e, u) {
        console.log("pageshow page2");
    });

    $("#btnReset").on("tap", function(e, u) {
        for (var i in ob.menu) {
            ob.menu[i].count = 0;

        }
    });
});
window.c = 0;