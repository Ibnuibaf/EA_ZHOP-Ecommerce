<div class="col-12 d-flex justify-content-center py-5">
    <div class="signup  my-5 p-5  fs-5 " style="background-color: #F3F2EE;">
        <form action="/admin" method="post" class="form-group">
            <h2 class="text-center" fs-3>ADMIN SignIn</h2>
            <% if (error) { %>
             
                <div class="error fs-6 m-3 p-2 bg-secondary text-center " style="max-width: 24vw;">
    
                    <i class="text-warning"><%= error %></i>
                    
                  
                </div>
            <% } %>
            <div class="form-group mt-2">
                <label for="Username">User Name:</label><br>
                <input type="email"  id="username" placeholder="Admin Username.." name="username"  >
            </div>
            

            <div class="form-group my-3">
                <label for="password">Password:</label><br>
                <input type="password"  id="password" placeholder="Admin password.." name="password" >
            </div>
       
            <div class="signup text-center">
                <button type="submit" class="btn btn-dark px-5 ">SignIn</button>
            </div>
        </form>
    </div>
</div>