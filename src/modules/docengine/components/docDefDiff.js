
import {canonicalize, Diff} from "diff";

let jsonDiff = new Diff(); // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
// dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:

jsonDiff.useLongestToken = true;
jsonDiff.tokenize = function (value) {
    let retLines = [],
        linesAndNewlines = value.split(/(\n|\r\n)/); // Ignore the final empty token that occurs if the string ends with a new line

    if (!linesAndNewlines[linesAndNewlines.length - 1]) {
        linesAndNewlines.pop();
    } // Merge the content and line separators into single tokens


    for (let i = 0; i < linesAndNewlines.length; i++) {
        let line = linesAndNewlines[i];

        if (i % 2 && !this.options.newlineIsToken) {
            retLines[retLines.length - 1] += line;
        } else {
            if (this.options.ignoreWhitespace) {
                line = line.trim();
            }

            retLines.push(line);
        }
    }

    return retLines;
};

jsonDiff.castInput = function (value) {
    var _this$options = this.options,
        _this$options$stringi = _this$options.stringifyReplacer,
        stringifyReplacer = _this$options$stringi === void 0 ? function (k, v) {
            if(k==='_X_ROW_KEY'){
                return undefined;
            }
            return v;
        } : _this$options$stringi;
    return typeof value === 'string' ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, '  ');
};

jsonDiff.equals = function (left, right) {
    return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'));
};

function diffDocDef(oldObj, newObj, options) {
    return jsonDiff.diff(oldObj, newObj, options);
}

export default diffDocDef;