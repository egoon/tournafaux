<form class="form-horizontal tournament-settings-form" role="form">
  <div class="row">
    <div class="col-md-4">
      <div class="form-group">
        <label for="rounds" class="col-sm-4 control-label">Rounds</label>
        <div class="col-sm-4">
          <input class="form-control settings-number" id="rounds" name="rounds" type="number" value="<%- settings.get('rounds') %>" title="Number of rounds."/>
        </div>
      </div>
      <div class="form-group">
        <label for="tables" class="col-sm-4 control-label">Tables</label>
        <div class="col-sm-4">
          <input class="form-control settings-number" id="tables" name="tables" type="number" title="Number of tables. Leave empty for players/2" value="<%- settings.get('tables') %>" placeholder=""/>
        </div>
      </div>
      <div class="checkbox">
        <label>
          <input type="checkbox" name="gg14" value="gg14">
          Gaining Grounds 2015
        </label> <a id="helpGG14">(?)</a>
      </div>
      <div class="checkbox">
        <label>
          <input type="checkbox" name="chooseFirstOpponent" value="chooseFirstOpponent">
          Choose First Opponent 
        </label> <a id="helpChooseFirstOpponent">(?)</a>
      </div>
    </div>

    <div class="col-md-4">
      <label>Bye <a id="helpBye">(?)</a> / Ringer <a id="helpRinger">(?)</a></label>
      <div class="radio">
        <label>
          <input type="radio" name="byes" value="average-bye" checked>
          Average Bye
        </label>
      </div>
      <div class="radio">
        <label>
          <input type="radio" name="byes" value="gg14-bye">
          GG'15 Bye
        </label>
      </div>
      <div class="radio">
          <label>
              <input type="radio" name="byes" value="competing-ringer">
              Competing Ringer
          </label>
      </div>
      <div class="radio">
          <label>
              <input type="radio" name="byes" value="non-competing-ringer">
              Non-competing Ringer
          </label>
      </div>
    </div>

    <div class="col-md-4">
      <label>Tournament Type <a id="helpTournamentType">(?)</a></label>
      <div class="radio">
          <label>
              <input type="radio" name="tournamentType" value="swiss" checked>
              Swiss
          </label>
      </div>
      <div class="radio">
          <label>
              <input type="radio" name="tournamentType" value="gg14-swiss">
              GG'15 Swiss-like
          </label>
      </div>
    </div>

  </div>

  <hr/>

  <div id="round-settings" class="row round-settings">
      <select id="rotation" class="form-control rotation-select" title="Rotation">
          <option>GG 15 New or Classic rotation</option>
          <option>New rotation Jan-Mar</option>
          <option>New rotation Apr-Jun</option>
          <option>New rotation Jul-Sep</option>
          <option>New rotation Oct-Dec</option>
          <option>Classic rotation Jan-Mar</option>
          <option>Classic rotation Apr-Jun</option>
          <option>Classic rotation Jul-Sep</option>
          <option>Classic rotation Oct-Dec</option>
          <option>Henchman hardcore</option>
      </select>
  </div>

  <a id="toggle-round-settings">Show/hide round settings</a> </label> <a id="helpRoundSettings">(?)</a>

  <table class="table table-striped player-settings">
    <tbody>
      <tr>
        <th style="width:20px">#</th>
        <th>Player name</th>
        <th>City/Club <a id="helpCityFaction">(?)</a></th>
        <th>Faction <a id="helpCityFaction">(?)</a></th>
        <th class="chooseFirstOpponent">Opponent</th>
        <th>Remove</th>
      </tr>
    </tbody>
    <tbody id="player-table">

      <tr id="new-player-row">
        <td></td>
        <td><input id="new-player" class="form-control" name="player" type="text" placeholder="New Player"/>
        </td><td></td><td></td><td></td>
      </tr>
    </tbody>
  </table>
  <ul id="validation-errors" class="text-danger" style="display:none"></ul>
  <button type="button" id="generate-first-round" class="btn btn-primary">Generate round 1</button>


</form>

<datalist id="factions">
    <option value="Arcanists"/>
    <option value="Crossroads Seven"/>
    <option value="Gremlins"/>
    <option value="Guild"/>
    <option value="Neverborn"/>
    <option value="Outcasts"/>
    <option value="Resurrectionists"/>
    <option value="Single Master"/>
    <option value="Ten Thunders"/>
  </datalist>

  <datalist id="citiesSweden" class="countryDataList">
    <option value="Göteborg"/>
    <option value="Linköping"/>
    <option value="Luleå"/>
    <option value="Lund"/>
    <option value="Malmö"/>
    <option value="Norrköping"/>
    <option value="Sala"/>
    <option value="Skellefteå"/>
    <option value="Stockholm"/>
    <option value="Umeå"/>
    <option value="Uppsala"/>
    <option value="Visby"/>
  </datalist>

  <datalist id="citiesUnitedKingdom" class="countryDataList">
    <option value="Belfast"/>
    <option value="Bradford"/>
    <option value="Bristol"/>
    <option value="Cardiff"/>
    <option value="Coventry"/>
    <option value="Dudley"/>
    <option value="East Riding"/>
    <option value="Edinburgh"/>
    <option value="Fife"/>
    <option value="Glasgow"/>
    <option value="Kirklees"/>
    <option value="Leeds"/>
    <option value="Leicester"/>
    <option value="Liverpool"/>
    <option value="London"/>
    <option value="Manchester"/>
    <option value="Newcastle"/>
    <option value="North Lanarkshire"/>
    <option value="Sheffield"/>
    <option value="South Lanarkshire"/>
    <option value="Wakefield"/>
    <option value="Wigan"/>
    <option value="Wirral"/>
    <option value="York"/>
  </datalist>