/**
 * Created by Jakob Rodseth on 9/12/2016.
 */

//------------------
//Objects
//------------------

function TestData(list, testAnswerClass, answerHash, opts)
{
    if (this instanceof TestData)
    {
        var questionList = list.getElementsByTagName("li");
        var numQuestions = questionList.length;
        var currentQuestion;
        var sequenceIndex = 0;
        var userAnswers = new Hashmap();
        var hashFunc;
        this.sequence = [];

        /*Private functions*/

        /*Utility Functions for TestData objects*/

        var initHashFunc = function ()
        {
            if (typeof answerHash !== 'undefined')
            {
                hashFunc = answerHash;
            }
            else
            {
                hashFunc = function (e)
                {
                    var key;
                    if (typeof (key = e.id) !== 'undefined')
                    {
                        return key;
                    }
                    else
                    {
                        throw new Error("SVG " + this + " has no data-group, parent with data-group, or id");
                    }
                }
            }
        };

        var buildQuestionAndAnswersPairs = function ()
        {
            for (var i = 0; i < numQuestions; i++)
            {
                var map = new Hashmap();
                if (!map.hashElementsByClass((testAnswerClass + i), hashFunc, true))
                {
                    if (arguments.length !== 4 || opts !== true)
                    {
                        console.warn("No answers found for question " + i + "! Did you mean to do this? Add \'true\' to TestData constructor call to suppress this warning");
                    }
                }
                this.sequence.push(new QuestionAndAnswers(i, map));
            }
            currentQuestion = questionList[0];
        };

        var shuffleSequence = function ()
        {
            this.sequence = shuffleArray(this.sequence);
            currentQuestion = getQuestionElementFromList.call(this, this.sequence[0].question);
        };

        var toggleQuestionVisible = function (questionElement, visible)
        {
            if (visible && !questionElement.classList.contains('display'))
            {
                questionElement.classList.add("display");
            }
            else if (!visible && questionElement.classList.contains('display'))
            {
                questionElement.classList.remove("display");
            }

        };

        var removeQuestionAtIndex = function (index)
        {
            this.sequence.splice(index, 1);
        };

        var findQuestionIndex = function (questionNum)
        {
            for (var i = 0; i < this.sequence.length; i++)
            {
                if (this.sequence[i].question === questionNum)
                {
                    return i;
                }
            }
            throw new Error("No question of index " + questionNum + " exists");
        };

        var getQuestionElementFromList = function (index)
        {
            return this.getList()[index];
        }

        /*Public functions*/

        this.addUserAnswer = function (element)
        {
            userAnswers.add(hashFunc(element), element);
        };

        this.removeUserAnswer = function (element)
        {
            userAnswers.remove(hashFunc(element));
        };

        this.getUserAnswers = function ()
        {
            return userAnswers;
        }

        this.containsUserAnswer = function (element)
        {
            return userAnswers.containsKey(hashFunc(element));
        };

        this.clearUserAnswers = function ()
        {
            userAnswers = new Hashmap();
        };

        this.getList = function ()
        {
            return questionList;
        };

        this.numQuestions = function ()
        {
            return questionList.length;
        };

        this.getAnswerMap = function ()
        {
            if (typeof (this.sequence[sequenceIndex].answers) !== 'undefined')
            {
                return this.sequence[sequenceIndex].answers;
            }
            else
            {
                return "none";
            }
        };

        this.getQuestion = function ()
        {
            return this.sequence[sequenceIndex].question;
        }

        this.nextQuestion = function (removeFromList)
        {
            toggleQuestionVisible.call(this, currentQuestion, false);
            if (removeFromList)
            {
                removeQuestionAtIndex.call(this, sequenceIndex);
                if (this.sequence.length === 0)
                {
                    return;
                }
            }
            sequenceIndex = (sequenceIndex + 1) % this.sequence.length;
            currentQuestion = getQuestionElementFromList.call(this, [this.sequence[sequenceIndex].question]);
            toggleQuestionVisible.call(this, currentQuestion, true);
            this.clearUserAnswers();
        };

        this.popQuestion = function (question)
        {
            var index = findQuestionIndex.call(this, question);
            var question = this.sequence[index];
            this.sequence.splice(index, 1);
            return question;
        }

        /*initialization*/

        initHashFunc();
        buildQuestionAndAnswersPairs.call(this);
        shuffleSequence.call(this);
        toggleQuestionVisible.call(this, currentQuestion, true);

    } else
    {
        return new TestData(list, testAnswerClass, answerHash, opts);
    }
}

TestData.prototype =
{
    constructor: TestData,

    checkAnswers: function ()
    {
        return Hashmap.prototype.compareMaps(this.getAnswerMap(), this.getUserAnswers());
    }
}

function QuestionAndAnswers(question, answers)
{
    if (this instanceof QuestionAndAnswers)
    {
        this.question = question;
        this.answers = answers;
    }
    else
    {
        return new QuestionAndAnswers();
    }
}

function SVGTextLabel(svgLabel, svgLabelText, svgTarget, container)
{
    if (this instanceof SVGTextLabel)
    {
        this.rect = svgLabel;
        this.label = svgLabelText;
        this.target = svgTarget;
        this.container = container;
    } else
    {
        return new SVGTextLabel(svgLabel, svgLabelText, svgTarget, container);
    }
}

function Hashmap(hashFunction)
{
    if (this instanceof Hashmap)
    {
        if (typeof hashFunction === 'function')
        {
            for (var i = 1; i < arguments.length; i++)
            {
                this.add(arguments[i].id, arguments[i]);
            }
        }
        return this;
    } else
    {
        throw new Error("\"this\" is not instance of Hashmap. Are you using the \"new\" keyword?");
    }
}

Hashmap.prototype =
{
    constructor: Hashmap,

    add: function (key, element)
    {
        //this[key] = element;
        if (typeof key === 'undefined')
        {
            console.warn('Key is undefined. Did you mean to do this?');
        }
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: true,
            writable: false,
            value: element
        });
    },

    remove: function (key)
    {
        if (this.hasOwnProperty(key))
        {
            var element = this[key];
            delete this[key];
            return element;
        }
        else
        {
            throw new Error("No Such Element Exception: Key \"" + key + "\" is not present within the hashmap.");
        }
    },

    get: function (key)
    {
        if (this.hasOwnProperty(key))
        {
            return this[key];
        }
        else
        {
            throw new Error("No Such Element Exception: Key \"" + key + "\" is not present within the hashmap.");
        }
    },

    getKeys: function ()
    {
        var keys = [];
        for (var propertyName in this)
        {
            if (this.hasOwnProperty(propertyName))
            {
                keys.push(propertyName);
            }
        }
        return keys;
    },

    size: function ()
    {
        return this.getKeys().length;
    },

    containsKey: function (key)
    {
        if (this.hasOwnProperty(key))
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    hashElementsByClass: function (className, hashFunction, valueOverride)
    {
        var elements = document.getElementsByClassName(className);
        if (elements.length === 0)
        {
            return false;
        }
        for (var i = 0; i < elements.length; i++)
        {
            var key = hashFunction(elements[i]);
            if (typeof key !== 'undefined')
            {
                if (arguments.length == 3)
                {
                    this.add(key, valueOverride);
                }
                else
                {
                    this.add(key, elements[i]);
                }
            }
            else
            {
                throw new Error("Null Exception: Key for "
                    + el.toString()
                    + " is null, make sure hashing function returns valid value for all elements tagged with class "
                    + className);
            }
        }
        return true;
    },

    compareMaps: function (map1, map2)
    {
        var map1Type = map1 instanceof Hashmap;
        var map2Type = map2 instanceof Hashmap;
        if (map1Type && map2Type)
        {
            var map1Keys = Object.keys(map1);
            var map2Keys = Object.keys(map2);
            if (map1Keys.length !== map2Keys.length)
            {
                return false;
            }
            else
            {
                for (var i = 0; i < map1Keys.length; i++)
                {
                    if (!map2.containsKey(map1Keys[i]))
                    {
                        return false;
                    }
                }
            }
            return true;
        }
        else if (map1 === 'none' && Object.keys(map2) <= 0)
        {
            return true
        }
        else
        {
            return false;
        }
    }

};

//-----------------
//Utility Functions
//-----------------

function shuffleArray(array)
{
    var counter = array.length;

    // While there are elements in the array
    while (counter > 0)
    {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

if (typeof module != 'undefined')
{
    module.exports.Hashmap = Hashmap;
    module.exports.SVGTextLabel = SVGTextLabel;
}