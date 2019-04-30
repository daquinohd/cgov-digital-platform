
var NCIAnalytics = {

    /* ********************************************************************** */
    TableSortHeaderClick: function(sender, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'SortTableHeaderClick');

        clickParams.Props = {
            05: "table_sort",
            67: pageName
        }
        clickParams.LogToOmniture(); 
    },
    /* ********************************************************************** */
    ProfilePanelLinkClick: function(sender, linkText, pageName) {
        clickParams = new NCIAnalytics.ClickParams (sender,
            'nciglobal', 'o', 'ProfilePanelLinkClick'); 
        
        clickParams.Props = {
            66: "InstitutionCard_" + pageName + "_" + linkText,
            67: 'D=pageName'
        }
        clickParams.LogToOmniture();
    }
};

