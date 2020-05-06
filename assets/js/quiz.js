/**
 * Created by jrodseth on 9/26/2016.
 */

function initialize()
{
    initializeTestData();
    makeSVGObjects();
    bindEvents();
}

function bindEvents()
{
    bindQuizClickables();
    bindQuizControls();
}

$(document).ready(function ()
{
    initialize();
});