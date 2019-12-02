/*
File: field_helpers.js

Author: Damien Delgotalle
Email: damien.delgotalle@envict.com
Web: http://www.envict.com

Revisions:
  V1.0  2018-01-16  Original release

Usage:
  1. Include this file to the head of your page:
     <script type="application/javascript" src="{% static 'localflavor_extended/js/field_helpers.js' %}"></script>
  2. Use "FieldHelpers.set(field_id, helper_id, argument)" to add a specific helper to a field.
     <script type="text/javascript">
         jQuery(function () {
             FieldHelpers.set('{{ form.nrn.id_for_label }}', 'be_nrn');
         });
     </script>

Helpers:
  be_date: Formats the value to 00/00/0000,
           Provides / automatically,
           Converts D to DD, M to MM and YY to YYYY automatically
  be_nrn: Formats the value to 00.00.00-000.00,
          Provides . and - automatically
*/

function FieldHelpers () {}


// Private static functions
FieldHelpers._char_is_digit = function (p_char) {
    return p_char >= "0" && p_char <= "9";
};

FieldHelpers._extract_digits_only = function (p_str) {
    var l_c, l_i = -1, l_digits = "";
    while (l_c = p_str[++l_i])
        if (l_c >= "0" && l_c <= "9")
            l_digits += l_c;
    return l_digits;
};

FieldHelpers._keyCode_is_delete = function (p_keyCode) {
    return p_keyCode === 8 || p_keyCode === 46;
};

FieldHelpers._keyCode_is_digit = function (p_keyCode) {
    return (p_keyCode >= 48 && p_keyCode <= 57) || (p_keyCode >= 96 && p_keyCode <= 105);
};


// Helpers
FieldHelpers._be_date = function (p_field_id, p_locale) {
    jQuery("#" + p_field_id).on('keyup', function(po_event) {
        if (!FieldHelpers._keyCode_is_delete(po_event.keyCode)) {
            var l_c, l_digits, l_i, l_value = "", l_century, l_year;
            l_digits = FieldHelpers._extract_digits_only(this.value);
            // In case of a date like "9/" -> provides "09/"
            if (l_digits.length === 1 && this.value.length === 2 && !FieldHelpers._char_is_digit(this.value[1]))
                l_digits = "0" + l_digits;
            // In case of a date like "09/3/" -> provides "09/03/"
            if (l_digits.length === 3 && this.value.length === 5 && !FieldHelpers._char_is_digit(this.value[5]))
                l_digits = l_digits.substr(0, 2) + "0" + l_digits[2];
            // In case of a date like "09/03/79" -> provides "09/03/1979"
            if (l_digits.length === 6 && this.value.length === 8) {
                l_century = Math.floor((new Date()).getFullYear()/100);
                l_year = parseInt(l_digits.substr(4, 2));
                if (l_year < l_century - 1)
                    l_digits = l_digits.substr(0, 4) + l_century + l_year;
                else if (l_year > l_century)
                    l_digits = l_digits.substr(0, 4) + (l_century - 1) + l_year;
            }
            // In case of a date like "09/03/20189" -> provides "09/03/189"
            if (l_digits.length === 9 && this.value.length === 11)
                l_digits = l_digits.substr(0, 4) + l_digits.substr(6, 3);
            l_i = -1;
            while (++l_i < 8 && (l_c = l_digits[l_i])) {
                l_value += l_c;
                if (l_i === 1 || l_i === 3) l_value += "/";
            }
            this.value = l_value;
        }
    }).datetimepicker({
        locale: p_locale,
        format: 'DD/MM/YYYY'
    });
};

FieldHelpers._be_nrn = function (p_field_id) {
    jQuery("#" + p_field_id).on('keyup', function(po_event) {
        if (!FieldHelpers._keyCode_is_delete(po_event.keyCode)) {
            var l_c, l_digits, l_i = -1, l_value = "";
            l_digits = FieldHelpers._extract_digits_only(this.value);
            while (++l_i < 11 && (l_c = l_digits[l_i])) {
                l_value += l_c;
                if (l_i === 1 || l_i === 3 || l_i === 8) l_value += ".";
                else if (l_i === 5) l_value += "-";
            }
            this.value = l_value;
        }
    });
};


// Public static functions
/*
    p_field_id: Identifier of the html field (= tag id)
    p_helper_id: 'be_date' | 'be_nrn'
    p_arg: (optional) A custom argument
*/
FieldHelpers.set = function (p_field_id, p_helper_id, p_arg) {
    var lf_helper = FieldHelpers["_" + p_helper_id];
    if (typeof(lf_helper) === 'function')
        lf_helper(p_field_id, p_arg);
};

