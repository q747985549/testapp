!(function (global) {
    var coi = function () {
        this.error = false;
        this.errorMsg = null;
        this.message = null;
        this.array2Data = function (data) {
            var newData = {};
            data.forEach(function (v) {
                newData[v.name] = v.value;
            })
            return newData;
        }
        this.string2Data = function (data) {
            var newData = {};
            data.split('&').forEach(function (v) {
                var key = v.split("=")[0];
                var value = v.split("=")[1];
                newData[key] = value;
            })
            return newData;
        }
        this.makeConditions = function (schema, key) {
            var conditions = {};
            schema[key].split('|').forEach(function (v) {
                if (/^min\((\d*)\)$/.test(v)) {
                    conditions['min'] = RegExp.$1;
                } else if (/^max\((\d*)\)$/.test(v)) {
                    conditions['max'] = RegExp.$1;
                } else if (/^regex\((.*)\)$/.test(v)) {
                    conditions['regex'] = RegExp.$1;
                } else {
                    conditions[v] = true;
                }
            });
            return conditions;
        }
        this.validate = function (data, schema, message) {
            if (data instanceof Array) {
                data = this.array2Data(data);
            }
            if (typeof (data) === 'string') {
                data = this.string2Data(decodeURIComponent(data));
            }
            this.message = message;
            for (var key in schema) {
                var value = data[key];

                if (schema[key]) {
                    var conditions = this.makeConditions(schema, key);
                }
                if (conditions.require && !value) {
                    this.setError(key, 'require')
                    return this.error;
                }

                if (conditions.string && (typeof (value) !== 'string')) {
                    this.setError(key, 'string')
                    return this.error;
                }
                if (conditions.number && (typeof (value) !== 'number')) {
                    this.setError(key, 'number')
                    return this.error;
                }
                if (conditions.min && (value.length < conditions.min)) {
                    this.setError(key, 'min')
                    return this.error;
                }
                if (conditions.max && (value.length > conditions.max)) {
                    this.setError(key, 'max')
                    return this.error;
                }
                if (conditions.regex) {
                    var regexp = new RegExp(conditions.regex);
                    if (!regexp.test(value)) {
                        this.setError(key, 'regex');
                        return this.error;
                    }
                }
                if (conditions.phone) {
                    var regexp = new RegExp('^1[3457689]\\d{9}$');
                    if (!regexp.test(value)) {
                        this.setError(key, 'phone');
                        return this.error;
                    }
                }
                if (conditions.email) {
                    var regexp = new RegExp(
                        '^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$');
                    if (!regexp.test(value)) {
                        this.setError(key, 'email');
                        return this.error;
                    }
                }
                if (conditions.alphanum) {
                    var regexp = new RegExp(
                        '^[0-9a-zA-Z]*$');
                    if (!regexp.test(value)) {
                        this.setError(key, 'alphanum');
                        return this.error;
                    }
                }

                if (conditions.iden) {
                    var regexp = new RegExp(
                        '(^[1-9]\\d{5}(18|19|([23]\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$)'
                    );
                    if (!regexp.test(value)) {
                        this.setError(key, 'iden');
                        return this.error;
                    }
                }
            }
            return this.error;
        }
        this.setError = function (key, type) {
            if (this.message && this.message[key] && this.message[key][type]) {
                this.errorMsg = this.message[key][type];
            } else {
                this.errorMsg = key + ' ' + type + ' error';
            }
            this.error = true;
        }
    }
    global.COI = coi;
})(window);