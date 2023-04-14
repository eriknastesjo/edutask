import pytest
import unittest.mock as mock
import re

# from src.util.helpers import hasAttribute, ValidationHelper
from src.controllers.usercontroller import UserController

@pytest.fixture
def sut(email, dao_response):
    mockeddao = mock.MagicMock()
    mockeddao.find.return_value = dao_response
    mockedsut = UserController(dao=mockeddao)
    return mockedsut

# test for the get_user_by_email_method 
@pytest.mark.unit
@pytest.mark.parametrize('email, dao_response, expected',
    [
        ('example@email.test', ['example@email.test'], 'example@email.test'),
        ('example@email.test', ['example@email.test', 'example2@email.test'], 'example@email.test'),
    ]
)
def test_get_user_by_email(sut, email, expected):
    result = sut.get_user_by_email(email=email)
    assert result == expected

# test for the get_user_by_email_method with invalid email
@pytest.mark.unit
@pytest.mark.parametrize('email, dao_response, expected',
    [('notValidEmail', ['example@email.test'], 'example@email.test')])
def test_get_user_by_email_validation(sut, email, expected):
    with pytest.raises(ValueError):
        result = sut.get_user_by_email(email=email)
        assert result == expected

# test for the get_user_by_email_method with Exception error
@pytest.mark.unit
@pytest.mark.parametrize('email, dao_response, expected',
    [('example@email.test', Exception, 'example@email.test')])
def test_get_user_by_email_exception(sut, email, expected):
    with pytest.raises(Exception):
        result = sut.get_user_by_email(email=email)
        assert result == expected
