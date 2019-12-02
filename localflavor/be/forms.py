# -*- coding: utf-8 -*-
"""BE-specific Form helpers"""

from django.forms.fields import RegexField, Select, CharField
from django.utils.translation import gettext_lazy as _
from django.forms import ValidationError
from django.core.validators import EMPTY_VALUES

from .be_provinces import PROVINCE_CHOICES
from .be_regions import REGION_CHOICES


class BEPostalCodeField(RegexField):
    """
    A form field that validates its input as a belgium postal code.

    Belgium postal code is a 4 digits string. The first digit indicates
    the province (except for the 3ddd numbers that are shared by the
    eastern part of Flemish Brabant and Limburg and the and 1ddd that
    are shared by the Brussels Capital Region, the western part of
    Flemish Brabant and Walloon Brabant)
    """

    default_error_messages = {
        'invalid': _(
            'Enter a valid postal code in the range and format 1XXX - 9XXX.'),
    }

    def __init__(self, *args, **kwargs):
        super().__init__(r'^[1-9]\d{3}$', *args, **kwargs)


class BERegionSelect(Select):
    """A Select widget that uses a list of belgium regions as its choices."""

    def __init__(self, attrs=None):
        super().__init__(attrs, choices=REGION_CHOICES)


class BEProvinceSelect(Select):
    """A Select widget that uses a list of belgium provinces as its choices."""

    def __init__(self, attrs=None):
        super().__init__(attrs, choices=PROVINCE_CHOICES)



class BENationalRegisterNumber(CharField):
    """
    Validates input as a Belgian National Identification number '00.00.00-000.00'.

    Validation of the Number, and checksum calculation is detailed at
    https://fr.wikipedia.org/wiki/Num%C3%A9ro_de_registre_national
    """

    default_error_messages = {
        'invalid': _(u"Numéro de Registre National non valide (00.00.00-000.00)."),
    }

    def clean(self, value):  # Check the data entered
        """
        Control the NRN value
        """
        super(BENationalRegisterNumber, self).clean(value)
        if not BENationalRegisterNumber.is_nrn_valid(value):
            raise ValidationError(self.error_messages['invalid'])
        return self.nrn_to_string(value)

    def prepare_value(self, value):  # Set the data to a specific format before using it
        return self.nrn_to_string(value)

    @staticmethod
    def is_nrn_valid(nrn):
        """
        Check if a NRN is empty or has the correct format 00.00.00-000.00
        """
        valid = True
        if nrn not in EMPTY_VALUES:
            valid = False
            nrn = BENationalRegisterNumber.string_to_nrn(nrn)
            if len(nrn) == 11:
                modulo = int(nrn[9:11])
                modulo_before_2000 = 97 - int(nrn[:9]) % 97
                modulo_from_2000 = 97 - int("2" + nrn[:9]) % 97
                valid = (modulo == modulo_before_2000) or (modulo == modulo_from_2000)
        return valid

    @staticmethod
    def nrn_to_string(nrn):
        """
        Convert a NRN 00000000000 to a formatted string "00.00.00-000.00"
        """
        if nrn not in EMPTY_VALUES:
            nrn = BENationalRegisterNumber.string_to_nrn(nrn)
            nrn = nrn[:2] + "." + nrn[2:4] + "." + nrn[4:6] + "-" + nrn[6:9] + "." + nrn[9:11]
        return nrn

    @staticmethod
    def string_to_nrn(string):
        """
        Convert a string like "00.00.00-000.00" or "00/00/00 000.00" or something else to a NRN 00000000000
        """
        if string not in EMPTY_VALUES:
            string = "".join([c for c in string if c.isdigit()])
        return string
