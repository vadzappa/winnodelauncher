var getUserName = function getUserName() {
    try {
        return process.env['USERNAME'];
    } catch (e) {
        return 'Zapolski';
    }
};

(function ($, _) {
    $(function () {
        $('.user').text(getUserName());
        $('.close-window').click(function (e) {
            if (confirm('Закрыть?')) {
                window.close();
            }
            e.preventDefault();
        });
    });
})(jQuery, _);