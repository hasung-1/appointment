module.exports={
    checkLogin: function checkLogin (req, res, next) {
      console.log(req.originalUrl);
        if (!req.user) {
          req.flash('error', '로그인하지 않았습니다.')
          console.log(req.header('Referer'));
          
          return res.redirect('/users/login/?page='+req.originalUrl)
        }
        next()
      },
    
      checkNotLogin: function checkNotLogin (req, res, next) {
        if (req.user) {
          req.flash('error', '로그인 되어있습니다.')
          return res.redirect('back')// 返回之前的页面
        }
        next()
      }
}