/**
 * Created by jrodseth on 9/12/2016.
 */

//------------------
//Variables
//------------------

var SVG_HIGHLIGHT_CLASS = "highlight-SVG";
var SVG_CLICKED_CLASS = "clicked-SVG";
var SVG_CLICKABLE_CLASS = "clickable_SVG";

var TEST_ANSWER_CLASS = "test-answer-";
var TEST_QUESTIONS_CLASS = 'test-questions';

var SVG_LABEL_CONTAINER_CLASS = "svg-label-container";
var SVG_LABEL_TEXT_CLASS = "svg-label-text";
var SVG_LABEL_CLASS = "svg-label";

var SUBMIT_BUTTON_CLASS = 'submit';
var NEXT_BUTTON_CLASS = 'next';
var FEEDBACK_AREA_CLASS = 'feedback';
var FEEDBACK_AREA_TEXT_CLASS = 'feedback-text';
var FEEDBACK_CORRECT_CLASS = 'correct';
var FEEDBACK_INCORRECT_CLASS = 'incorrect';

var svgBundlesMap;
var svgLabelList = new Hashmap();
var test;

var numQuestions;
var numIncorrect;
var numCorrect;

var done = false;
var testRunning = true;

var result;

var hashSVG = function (e)
{
    var key;
    if ((typeof (key = $(e).attr('data-group')) !== 'undefined') ||
        (typeof (key = $(e).parent().attr('data-group')) !== 'undefined') ||
        (typeof (key = $(e).id) !== 'undefined'))
    {
        return key;
    }
    else
    {
        throw new Error("SVG " + this + " has no data-group, parent with data-group, or id");
    }
};

//------------------
//Initialization
//------------------

function makeSVGObjects()
{
    $('.' + SVG_LABEL_CONTAINER_CLASS).each(function ()
    {
        var label = $(this).children($('.' + SVG_LABEL_CLASS)).get(0);
        var labelText = $(this).children($('.' + SVG_LABEL_TEXT_CLASS)).get(0);
        var target = $(this).attr('data-target');
        var container = $(this).get(0);
        var labelObject = new SVGTextLabel(label, labelText, target, container);
        svgLabelList.add(target, labelObject);
    });

    svgBundlesMap = new Hashmap();

    $('.' + SVG_CLICKABLE_CLASS).each(function ()
    {
        var key = hashSVG(this);
        console.log(key);
        var array;
        if (svgBundlesMap.containsKey(key))
        {
            array = svgBundlesMap.remove(key);
        }
        else
        {
            array = [];
        }
        array.push(this);
        svgBundlesMap.add(key, array);

    });
}

function initializeTestData()
{
    numIncorrect = 0;
    numCorrect = 0;
    test = new TestData($('.' + TEST_QUESTIONS_CLASS).get(0), TEST_ANSWER_CLASS, hashSVG, true);
    for (var i = 0; i < test.sequence.length; i++)
    {
        var classString = TEST_ANSWER_CLASS + i.toString();
        toggleClass($('.' + classString), classString);
    }
    numQuestions = test.numQuestions();
    $('.' + FEEDBACK_CORRECT_CLASS).html(numCorrect + " / " + numQuestions);
}

//------------------
//Event Bindings
//------------------

function bindSVGClickables()
{
    $('.' + SVG_CLICKABLE_CLASS).mouseenter(handleSVGMouseEnter);
    $('.' + SVG_CLICKABLE_CLASS).mouseleave(handleSVGMouseLeave);
}

function bindQuizClickables()
{
    $('.' + SVG_CLICKABLE_CLASS).click(handleSVGQuizClick);
    bindSVGClickables();
}

function bindMapClickables()
{
    $('.' + SVG_CLICKABLE_CLASS).click(handleSVGMapClick);
    bindSVGClickables();
}

function bindQuizControls()
{
    $('.' + SUBMIT_BUTTON_CLASS).click(handleSubmitClick);
    $('.' + NEXT_BUTTON_CLASS).click(handleNextClick);
}

//------------------
//Event Handlers
//------------------

function handleSVGMouseEnter()
{
    if (testRunning)
    {
        var key = hashSVG(this);
        if (typeof key !== 'undefined')
        {
            var array = svgBundlesMap.get(key);
            for (var i = 0; i < array.length; i++)
            {
                if (!$(array[i]).hasClass(SVG_HIGHLIGHT_CLASS))
                {
                    $(array[i]).addClass(SVG_HIGHLIGHT_CLASS);
                }
            }
        }
        else
        {
            console.warn(this + "has no group");
            if (!$(this).hasClass(SVG_HIGHLIGHT_CLASS))
            {
                $(this).addClass(SVG_HIGHLIGHT_CLASS);
            }
        }
    }
}

function handleSVGMouseLeave()
{
    if (testRunning)
    {
        var key = hashSVG(this);
        if (typeof key !== 'undefined')
        {
            var array = svgBundlesMap.get(key);
            for (var i = 0; i < array.length; i++)
            {
                if ($(array[i]).hasClass(SVG_HIGHLIGHT_CLASS) && !$(this).hasClass(SVG_CLICKED_CLASS))
                {
                    $(array[i]).removeClass(SVG_HIGHLIGHT_CLASS);
                }
            }
        }
        else
        {
            if ($(this).hasClass(SVG_HIGHLIGHT_CLASS) && !$(this).hasClass(SVG_CLICKED_CLASS))
            {
                $(this).removeClass(SVG_HIGHLIGHT_CLASS);
            }
        }
        var key;
        if (svgLabelList.containsKey(key = hashSVG(this)))
        {
            var container = svgLabelList.get(key).container;
            if ($(container).hasClass('visible'))
            {
                $(container).removeClass('visible');
            }
        }
    }
}

function handleSVGQuizClick()
{
    if (testRunning)
    {
        if (test.containsUserAnswer(this))
        {
            test.removeUserAnswer(this);
            $(this).removeClass(SVG_CLICKED_CLASS);
            $(this).removeClass(SVG_HIGHLIGHT_CLASS);
        }
        else
        {
            test.addUserAnswer(this);
            $(this).addClass(SVG_CLICKED_CLASS);
            handleSubmitClick();//If there are multiple answers to a question, this must be removed and bound to a submit button.
        }
    }
}

function handleSVGMapClick()
{
    if (testRunning)
    {
        var key;
        if (svgLabelList.containsKey(key = hashSVG(this)))
        {
            var container = svgLabelList.get(key).container;
            if (!$(container).hasClass('visible'))
            {
                $(container).addClass('visible');
            }
        }
        else
        {
            console.warn("Element has no label");
        }
    }
}

function handleSubmitClick()
{
    if (!done && testRunning)
    {
        result = test.checkAnswers();
        $('.' + FEEDBACK_AREA_CLASS).toggleClass("hidden");
        if (!result)
        {
            numIncorrect++;
            $('.' + FEEDBACK_INCORRECT_CLASS).html(numIncorrect);
        }
        else
        {
            numCorrect++;
            $('.' + FEEDBACK_CORRECT_CLASS).html(numCorrect + " / " + numQuestions);
        }
        if (result)
        {
            if (test.sequence.length <= 1)
            {
                $('.' + FEEDBACK_AREA_TEXT_CLASS).html("\<span style=\'color:blue\'\>\<b\>Correct!\<b\>\</span\>\<br>\<span style=\'color:green\'\>\<b\>Quiz Complete\<b\>\</span\>");
                $('.' + NEXT_BUTTON_CLASS).text("Restart Quiz");
                done = true;
            }
            else
            {
                $('.' + FEEDBACK_AREA_TEXT_CLASS).html("\<span style=\'color:blue\'\>\<b\>Correct!\<b\>\</span\>");
            }
        }
        else
        {
            $('.' + FEEDBACK_AREA_TEXT_CLASS).html("\<span style=\'color:red\'\>\<b\>Incorrect\<b\>\</span\>");
        }
        testRunning = false;
    }
}

function handleNextClick()
{
    if (done)
    {
        restart();
    }
    test.nextQuestion(result);
    $('.' + SVG_CLICKABLE_CLASS).removeClass(SVG_HIGHLIGHT_CLASS).removeClass(SVG_CLICKED_CLASS);
    $('.' + FEEDBACK_AREA_CLASS).toggleClass("hidden");
    testRunning = true;
}

function restart()
{
    window.location.reload(false);
}

//------------------
//Utility Functions
//------------------

function toggleClass(element, className)
{
    if (!$(element).hasClass(className))
    {
        $(element).addClass(className);
    }
    else
    {
        $(element).removeClass(className);
    }
}

//------------------
//Doc Ready
//------------------