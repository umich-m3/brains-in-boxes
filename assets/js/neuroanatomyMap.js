/**
 * Created by jrodseth on 9/26/2016.
 */

function initialize()
{
    makeSVGObjects();
    bindEvents();
}

function bindEvents()
{
    bindMapClickables();
}

$(document).ready(function ()
{
    initialize();
});