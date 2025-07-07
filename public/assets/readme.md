# DESP Theme

## how to add theme to your app

```html
<!--    ===========================================================
        HEAD SECTION
        -----------------------------------------------------------
        Insert the following code snippets to the head section
        of your HTML file
        =========================================================== -->

<!-- Add roboto font -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

<!-- Add .css -->
<link rel="stylesheet" href="https://collaborative.desp-aas.acri-st.fr/assets/desp-theme.css">
<link rel="stylesheet" href="https://collaborative.desp-aas.acri-st.fr/assets/desp-theme-button.css">
<link rel="stylesheet" href="https://collaborative.desp-aas.acri-st.fr/assets/desp-theme-footer.css">
<link rel="stylesheet" href="https://collaborative.desp-aas.acri-st.fr/assets/desp-theme-header.css">

<!--    ===========================================================
        BOTTOM SECTION
        -----------------------------------------------------------
        Add the .js at the bottom of the HTML page in the body
        =========================================================== -->
<script type="text/javascript" src="https://collaborative.desp-aas.acri-st.fr/assets/desp-theme.js"></script>
<script type="text/javascript" src="https://collaborative.desp-aas.acri-st.fr/assets/desp-theme-footer.js"></script>
<script type="text/javascript" src="https://collaborative.desp-aas.acri-st.fr/assets/desp-theme-header.js"></script>
<script>
    // Configure the theme's variables if needed
    // example:
    despTheme.headers = [
        // { label: 'Home', link: '/' },
    ]

    // lOAD THEME
    loadDespTheme();
</script>
```


## Config