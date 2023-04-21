import pytest
import unittest.mock as mock
from unittest.mock import patch
from pymongo.errors import WriteError

from src.util.dao import DAO

class TestDaoCreate:
    """
    Test the create method of DAO class.
    """
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["string_field", "bool_field", "unique_field"],
            "properties": {
                "string_field": {
                    "bsonType": "string",
                    "description": "a string the must be filled"
                }, 
                "bool_field": {
                    "bsonType": "bool",
                    "description": "a boolean field that must be filled"
                },
                "unique_field": {
                    "bsonType": "string",
                    "description": "a unique_field that must be filled",
                    "uniqueItems": True
                },
                "non_required_field": {
                    "bsonType": "string",
                    "description": "a non-required field that is not required to be filled"
                }
            }
        }
    }

    ################ FIXTURE SETUP ##################
    @pytest.fixture
    def sut(self):
        with patch("src.util.dao.getValidator", autospec=True) as mockedgetvalidator:
            mockedgetvalidator.return_value = self.validator

            sut = DAO(collection_name="test")

            yield sut

            sut.collection.drop()

    ###### ALL VALID ############################
    @pytest.mark.parametrize('data, expected',
        [
            ({"string_field": "string", "bool_field": True, "unique_field": "unique", "non_required_field": "non_required"}, dict),
            ({"string_field": "string", "bool_field": True, "unique_field": "unique"}, dict),
        ]
    )
    @pytest.mark.integration
    def test_validated(self, sut, data, expected):
        result = sut.create(data)
        assert isinstance(result, expected)

    ###### REQUIRED FIELD MISSING ###############
    @pytest.mark.parametrize('data',
        [
            ({"string_field": "string", "bool_field": True}),
            ({"string_field": "string", "unique_field": "unique"}),
            ({"bool_field": True, "unique_field": "unique"}),
        ]
    )
    @pytest.mark.integration
    def test_required_missing(self, sut, data):
        with pytest.raises(WriteError):
            sut.create(data)

    ###### NOT UNIQUE ###########################
    @pytest.mark.parametrize('data',
        [
            ({"string_field": "string", "bool_field": True, "unique_field": "unique"}),
        ]
    )
    @pytest.mark.integration
    def test_not_unique(self, sut, data):
        sut.create(data)
        with pytest.raises(WriteError):
            sut.create(data)

    ###### DATA TYPE VIOLATED ###################
    @pytest.mark.parametrize('data',
        [
            ({"string_field": 1, "bool_field": True, "unique_field": "unique"}),
            ({"string_field": "string", "bool_field": "True", "unique_field": "unique"}),
        ]
    )
    @pytest.mark.integration
    def test_data_type_violated(self, sut, data):
        with pytest.raises(WriteError):
            sut.create(data)
            