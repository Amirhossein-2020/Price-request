window.onload = init;

function init() {
    let departProv = document.getElementById('departProv');
    let destinProv = document.getElementById('destinProv');
    let vehicles = document.getElementById('vehicles');
    let destinCity = document.getElementById('destinCity');
    let departCity = document.getElementById('departCity');
    let submit = document.getElementById('btn');
    let min = document.getElementById('min');
    let max = document.getElementById('max');
    let price = document.getElementById('price');
    let departProvSelected;
    let destinProvSelected;
    let vehicle_requested = 0;
    let source_location = {
        lat: 0,
        long: 0
    };
    let destination_location = {
        lat: 0,
        long: 0
    };
    let res;
    let respon;

    function render(d) {
        // console.log(d);
        if (d.length == 31) {
            d.forEach(element => {
                departProv.innerHTML += '<option value="' + element.provincename + '">' + element.provincename + '</option>';
                departProv.disabled = false;
                destinProv.innerHTML += '<option value="' + element.provincename + '">' + element.provincename + '</option>';
                destinProv.disabled = false;
            });
            eventHandler(d, departProv, null, null);
            eventHandler(d, null, destinProv, null);
        } else if (d.length < 31) {
            d.forEach(element => {
                vehicles.innerHTML += '<option value="' + element.v_name + '">' + element.v_name + '</option>';
                vehicles.disabled = false;
            });
            eventHandler(d, null, null, vehicles);
        } else {
            min.innerHTML = toFarsiNumber(numberWithCommas(d.from));
            max.innerText = toFarsiNumber(numberWithCommas(d.to));
            price.innerText = toFarsiNumber(numberWithCommas(d.suggested_price));
        }
    }

    function eventHandler(d, depart, destin, vehicle) {
        if (depart) {
            depart.onchange = function() {
                departCity.innerHTML = '<option value="">انتخاب شهر</option>';
                this.nextElementSibling.disabled = true;
                d.forEach(element => {
                    if (element.provincename == depart.value) {
                        departProvSelected = element;
                        loadCity(this, null, element);
                    }
                });
            }
        } else if (destin) {
            destin.onchange = function() {
                destinCity.innerHTML = '<option value="">انتخاب شهر</option>';
                this.nextElementSibling.disabled = true;
                d.forEach(element => {
                    if (element.provincename == destin.value) {
                        destinProvSelected = element;
                        loadCity(null, this, element);
                    }
                });
            }
        } else if (vehicles) {
            vehicle.onchange = function() {
                d.forEach(element => {
                    if (element.v_name == vehicle.value) {
                        vehicle_requested = element._id;
                        // console.log('vehicle_requested', vehicle_requested)
                    }
                });
            }
        }
    }

    function loadCity(dp, ds, p) {
        let departCityList = [];
        let destinCityList = [];
        if (dp) {
            dp.nextElementSibling.disabled = false;
            for (i = 0; i < p._city.length; i++) {
                departCityList.push(p._city[i]);
                departCity.innerHTML += '<option value="' + p._city[i].shahrname + '">' + p._city[i].shahrname + '</option>';
            }
            citySelect(departCityList, null);
        } else if (ds) {
            ds.nextElementSibling.disabled = false;
            for (i = 0; i < p._city.length; i++) {
                destinCityList.push(p._city[i]);
                destinCity.innerHTML += '<option value="' + p._city[i].shahrname + '">' + p._city[i].shahrname + '</option>';
            }
            citySelect(null, destinCityList);
        }
    }

    function citySelect(dpl, dsl) {
        if (dpl) {
            departCity.onchange = function() {
                dpl.forEach(element => {
                    if (element.shahrname == departCity.value) {
                        source_location.lat = element.lat;
                        source_location.long = element.long;
                    }
                });
            };
        } else if (dsl) {
            destinCity.onchange = function() {
                dsl.forEach(element => {
                    if (element.shahrname == destinCity.value) {
                        destination_location.lat = element.lat;
                        destination_location.long = element.long;
                    }
                });
            };
        }

    }
    submit.addEventListener('click', function() {
        if (!departProv.value || !destinProv.value || !vehicles.value || !departCity.value || !destinCity.value) {
            throw ("لطفاً تمام گزینه ها انتخاب شود")
        } else {
            let item_to_send = {
                source_location: source_location,
                destination_location: destination_location,
                vehicle_requested: vehicle_requested
            }
            loadJson("POST", "http://192.168.3.177:3000/tariff", JSON.stringify(item_to_send), function(d) {
                render(d);
            })
        }
    })

    function loadJson(m, u, d, callback) {
        let xhr = new XMLHttpRequest;
        xhr.open(m, u);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader('api_key', '65072769-e2dd-5caa-998e-90e6b119f59e');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                res = JSON.parse(xhr.response);
                callback(res);
            } else if (xhr.readyState == 4 && xhr.status == 201) {
                respon = JSON.parse(xhr.response)
                callback(respon);
            }
        }
        xhr.send(d);
    }
    loadJson("GET", "http://192.168.3.177:3000/citeis", null, function(d) {
        render(d)
    })
    loadJson("GET", "http://192.168.3.177:3000/vehicles", null, function(d) {
        render(d)
    })
}

function toFarsiNumber(n) {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    return n
        .toString()
        .replace(/\d/g, x => farsiDigits[x]);
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};