<div class="row">
  <div class="col-md-9">
    <ul class="nav nav-pills" style="margin-bottom: 10px;">
      <li <%= active == "settings" ? 'class="active"' : '' %> ><a href="">Settings</a></li>
      <% _.each(rounds, function(round) { %>
      <li <%= active == round.get('number') ? 'class="active"' : '' %> ><a href='#/round/<%- round.get("number") %>'>Round <%- round.get("number") %></a></li>
      <% }); %>
      <li id="results" <%= active == "results" ? 'class="active"' : '' %> ><a href="#/results">Results</a></li>
    </ul>
  </div>
  <div class="col-md-3">
    <a id="new-tournament" class="btn btn-danger">Clear/New Tournament</a>
  </div>
</div>
<hr/>