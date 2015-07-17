// initialize data

var itemlist = [];

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
    };

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
    };

    this.orderItem = function(name) {
        var item = this.menu[name];
        item.count++;
        this.menuCount++;
        order.count++;
        this.ordersCount++;
    };

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
    };
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
        };
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
        };
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