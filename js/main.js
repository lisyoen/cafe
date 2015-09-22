/*global jQuery, Handlebars, Router */
define([
], function () {
    'use strict';

    Handlebars.registerHelper('eq', function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });

    var CONST = {
        APPDATA_VERSION: 1,
        MENU_VERSION: 1,
        GITHUB_URL: "https://api.github.com/repos/lisyoen/cafe/issues?label='menu contents'",
        DEFAULT_CATALOG_URL: "./js/menu.json",
        STORAGE_NAME: "cafe-menu"
    };

    var util = {
        store: function (namespace, data) {
            if (arguments.length > 1) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            } else {
                var store = localStorage.getItem(namespace);
                return (store && JSON.parse(store)) || [];
            }
        },
    };

    var MenuItem = new Class();
    MenuItem.include({
        index: 0,
        name: "",
        isCategory: false,
        count: 0,
        init: function (name) {
            if (name.substr(0, 1) === "-") {
                this.isCategory = true;
                this.name = name.substr(1);
            } else {
                this.isCategory = false;
                this.name = name;
            }
        }
    });

    var MenuCatalog = new Class();
    MenuCatalog.include({
        menuVersion: CONST.MENU_VERSION,
        cafeName: "",
        menuItems: [],  // array of MenuItem
        init: function (jsonString) {
            var json;
            try {
                json = $.parseJSON(jsonString);
            } catch (err) {
                console.log("json Parsing Error");
                return;
            }
            this.menuVersion = json.menuVersion;
            this.cafeName = json.cafeName;
            for (var i in json.menuList) {
                this.menuItems.push(new MenuItem(json.menuList[i]));
            }
        }
    });

    var AppData = new Class();
    AppData.include({
        version: CONST.APPDATA_VERSION,
        catalogs: [], // array of MenuCatalog
        curCatalogIndex: 0,
    });

    var appData = new AppData();

    var app = {
        init: function () {
            this.todos = util.store(CONST.STORAGE_NAME);
            this.cacheElements();
            this.bindEvents();

            this.loadAppData();
        },
        
        cacheElements: function () {
            this.cafeNameTemplate = Handlebars.compile($('#cafe-name-template').html());
            this.catalogTemplate = Handlebars.compile($('#catalog-template').html());
            this.$title = $("title");
            this.$cafeName = $('#cafe-name');
            this.$ordersBtn = $('#orders-button');
            this.$orderList = $('#order-list');
            this.$resetOrdersBtn = $('#reset-orders-button');
            this.$menuTable = $('#menu-table');
        },
        
        bindEvents: function () {
            /*
            var list = this.$todoList;
            this.$newTodo.on('keyup', this.create.bind(this));
            this.$toggleAll.on('change', this.toggleAll.bind(this));
            this.$footer.on('click', '#clear-completed', this.destroyCompleted.bind(this));
            list.on('change', '.toggle', this.toggle.bind(this));
            list.on('dblclick', 'label', this.edit.bind(this));
            list.on('keyup', '.edit', this.editKeyup.bind(this));
            list.on('focusout', '.edit', this.update.bind(this));
            list.on('click', '.destroy', this.destroy.bind(this));
            */
            $.subscribe("update.title", this.renderTitle.bind(this));
            $.subscribe("update.catalog", this.renderMenuCatalog.bind(this));
            
        },
        
        renderMenuCatalog: function () {
            var catalog = appData.catalogs[appData.curCatalogIndex];
            this.$menuTable.html(this.catalogTemplate(catalog.menuItems));
        },
        
        renderOrders: function () {

        },
        
        renderTitle: function () {
            var catalog = appData.catalogs[appData.curCatalogIndex];
            this.$title.html(this.cafeNameTemplate({
                cafeName: catalog.cafeName
            }));
            this.$cafeName.html(this.cafeNameTemplate({
                cafeName: catalog.cafeName
            }));
        },
        
        loadAppData: function () {
            if (!this.loadAppDataFromLocalStorage()) {
                this.loadAppDataFromGitHub(function () {
                    this.saveAppDataToLocalStorage();
                    console.log('Menu loading success');
                    $.publish("update.title");
                    $.publish("update.catalog");
                }, function () {
                    this.loadAppDataFromDefaultUrl(function () {
                        console.log('Default menu loading success');
                        $.publish("update.title");
                        $.publish("update.catalog");
                    }, function() {
                        console.log('Menu loading fail');
                        alert('Menu loading fail');
                    });
                });
            }
        },
        
        loadAppDataFromLocalStorage: function () {
            var storedData = localStorage.getItem(CONST.STORAGE_NAME);
            if (!storedData) {
                return false;
            } else {
                console.log("menuString = " + storedData);
                var newAppData = new AppData();
                var data = JSON.parse(storedData);
                if (data.length === 0 || !data.version) {
                    localStorage.removeItem(CONST.STORAGE_NAME);
                    return false;
                }
                // Todo: check data version

                newAppData.version = CONST.APPDATA_VERSION;
                newAppData.catalogs = data.catalogs;
                newAppData.curCatalogIndex = data.curCatalogIndex;
                appData = newAppData;
                return true;
            }
        },
        
        loadAppDataFromGitHub: function (success, fail, anyway) {
            var that = this;
            $.getJSON(CONST.GITHUB_URL)
            .done(function (json) {
                console.log(json);
                var newAppData = new AppData();
                var issues = json;
                for (var i in issues) {
                    var issue = issues[i];
                    var newCatalog = new MenuCatalog(issue.body);
                    appData.catalogs.push(newCatalog);
                }
                if (appData.catalogs.length > 0) {
                    console.log('load AppData success');
                    if (success) success.call(that);
                } else {
                    console.log('load AppData fail');
                    if (fail) fail.call(that);
                }
            })
            .fail(function () {
                console.log('getJSON fail');
                if (fail) fail.call(that);
            })
            .always(function() {
                if (anyway) anyway.call(that);
            });
        },
        
        loadAppDataFromDefaultUrl: function (success, fail, anyway) {
            var that = this;
            $.getJSON(CONST.DEFAULT_CATALOG_URL)
            .done(function (json) {
                console.log(json);
                var newAppData = new AppData();
                var issue = json;
                var newCatalog = new MenuCatalog(issue.body);
                appData.catalogs.push(newCatalog);
                if (newCatalog.menuItems.length > 0) {
                    console.log('load AppData from default success');
                    if (success) success.call(that);
                } else {
                    console.log('load AppData from default fail');
                    if (fail) fail.call(that);
                }
            })
            .fail(function () {
                console.log('load AppData from default getJSON fail');
                if (fail) fail.call(that);
            })
            .always(function() {
                if (anyway) anyway.call(that);
            });
        },
        
        saveAppDataToLocalStorage: function () {
            localStorage.setItem(CONST.STORAGE_NAME, JSON.stringify(appData));
        }
    };

    var self = app;

    $(function () {
        console.log('onload');
        app.init();
    });
});


$(function () {
    console.log('init');
    /*
    $("#menu-table").delegate("td.menu-name", "click", function () {
        console.log(this);
    });
    $("#menu-table").delegate("td.menu-count", "click", function () {
        console.log(this);
    });

    var source = $("#menu-template").html();
    var template = Handlebars.compile(source);
    $("#menu-table").html(template(menus.items[0]));
*/
});